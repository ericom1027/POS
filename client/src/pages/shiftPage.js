import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Table } from "react-bootstrap";
import Box from "@mui/material/Box";
import Sidenav from "../components/Sidenav";
import UserContext from "../UserContext";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { useReactToPrint } from "react-to-print";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import moment from "moment-timezone";

const ShiftPage = () => {
  const { user, setUser } = useContext(UserContext);
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [dailyTotalSales, setDailyTotalSales] = useState(0); // State for daily total sales
  const componentRef = useRef();

  const toastOptions = {
    autoClose: 900,
    pauseOnHover: true,
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const formatDate = (date) => {
    const formattedDate = moment(date).format("MM-DD-YYYY");
    return formattedDate;
  };

  const fetchShifts = async () => {
    try {
      const formattedDate = formatDate(selectedDate);
      const response = await axios.post(
        "https://pos-cbfa.onrender.com/shifts/allShift",
        { selectedDate: formattedDate }
      );
      if (response.status === 200) {
        setShifts(response.data.allShifts);
      } else {
        toast.error("Error fetching shifts:", response.data, toastOptions);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [selectedDate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      axios
        .get(`https://pos-cbfa.onrender.com/shifts/getShift`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setShifts(response.data);
          setUser(response.data);
        })
        .catch((error) => toast.error("Error fetching user data:", error));
    }
  }, [user, setUser]);

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const response = await axios.post(
          "https://pos-cbfa.onrender.com/bills/day-sales",
          {
            startOfDay: startOfDay,
            endOfDay: endOfDay,
          }
        );

        const dailySales = response.data.dailySales;

        let total = 0;
        for (const date in dailySales) {
          total += dailySales[date];
        }

        setDailyTotalSales(total);
      } catch (error) {
        console.error("Error fetching daily sales:", error);
      }
    };

    fetchDailySales();
  }, []);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const pageCount = shifts ? Math.ceil(shifts.length / itemsPerPage) : 0;
  const indexOfLastItem = shifts ? currentPage * itemsPerPage : 0;
  const indexOfFirstItem = shifts ? indexOfLastItem - itemsPerPage : 0;
  const currentItems = shifts
    ? shifts.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <div className="w-100 py-5 mt-5 mb-5 p-3">
        <Button
          className="d-flex mt-2 ms-auto"
          variant="primary"
          onClick={handlePrint}
        >
          Print
        </Button>
        <div className="container-fluid" ref={componentRef}>
          <h4>Employee Shift Reports</h4>
          <label>Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            maxDate={new Date()}
          />

          <Table className="mt-4" striped bordered hover>
            <thead className="text-center">
              <tr>
                <th>No.</th>
                <th>Cashier name</th>
                <th>Date</th>
                <th>Opening time</th>
                <th>Closing time</th>
                <th>Starting cash</th>
                <th>Actual cash amount</th>
                <th>Expected cash amount</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {!currentItems || currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    No records found for the selected date.
                  </td>
                </tr>
              ) : (
                currentItems.map((shift, index) => {
                  const difference =
                    shift.startingCash + shift.endingCash - dailyTotalSales; // Calculate the difference
                  return (
                    <tr key={`shift-${index}`}>
                      <td>{index + 1}</td>
                      <td>{shift.user.firstName}</td>
                      <td>{moment(shift.startTime).format("MM-DD-YYYY")} </td>
                      <td>{moment(shift.startTime).format("hh:mm:ss A")} </td>
                      <td>{moment(shift.endTime).format("hh:mm:ss A")} </td>
                      <td>
                        {shift.startingCash
                          ? shift.startingCash.toFixed(2)
                          : "0.00"}
                      </td>
                      <td>
                        {shift.endingCash
                          ? shift.endingCash.toFixed(2)
                          : "0.00"}
                      </td>
                      <td>{dailyTotalSales.toFixed(2)}</td>{" "}
                      {/* Display daily total sales */}
                      <td>{difference.toFixed(2)}</td>{" "}
                      {/* Display the calculated difference */}
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
        <Stack spacing={2} alignItems="flex-end">
          <Pagination
            color="primary"
            count={pageCount}
            renderItem={(item) => (
              <PaginationItem
                slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                {...item}
              />
            )}
            onChange={(event, page) => paginate(page)}
          />
        </Stack>
      </div>
    </Box>
  );
};

export default ShiftPage;
