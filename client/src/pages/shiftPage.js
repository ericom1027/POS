import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Table } from "react-bootstrap";
import Box from "@mui/material/Box";
import Sidenav from "../components/Sidenav";
import UserContext from "../UserContext";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { useReactToPrint } from "react-to-print";
import moment from "moment-timezone";

const ShiftPage = () => {
  const { user, setUser } = useContext(UserContext);
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailySalesPerCashier, setDailySalesPerCashier] = useState({});
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
        const timestamp = selectedDate.getTime();
        const response = await axios.get(
          "https://pos-cbfa.onrender.com/bills/daily-sales",
          {
            params: {
              createdAt: timestamp,
            },
          }
        );

        const salesByCashier = {};
        response.data.forEach((transaction) => {
          const { cashierName, totalAmount, createdAt } = transaction;
          const transactionDate = new Date(createdAt);
          const day = transactionDate.toLocaleDateString();

          if (!salesByCashier[cashierName]) {
            salesByCashier[cashierName] = { day, totalSales: 0, cashierName };
          }

          salesByCashier[cashierName].totalSales += totalAmount;
        });

        setDailySalesPerCashier(salesByCashier);
      } catch (error) {
        console.error("Error fetching daily sales:", error);
      }
    };

    fetchDailySales();
  }, [selectedDate]);

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
                <th>Total Amount</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift, index) => {
                const startingCash = parseFloat(shift.startingCash) || 0;
                const endingCash = parseFloat(shift.endingCash) || 0;
                const cashierName = shift.user.firstName;
                const expectedCashAmount =
                  dailySalesPerCashier[cashierName]?.totalSales || 0;
                const total = endingCash - startingCash;
                const difference = expectedCashAmount - total;
                return (
                  <tr key={`shift-${index}`}>
                    <td>{index + 1}</td>
                    <td>{cashierName}</td>
                    <td>{moment(shift.startTime).format("MM-DD-YYYY")}</td>
                    <td>{moment(shift.startTime).format("hh:mm:ss A")}</td>
                    <td>{moment(shift.endTime).format("hh:mm:ss A")}</td>
                    <td>{startingCash.toFixed(2)}</td>
                    <td>{endingCash.toFixed(2)}</td>
                    <td>
                      {typeof expectedCashAmount === "number"
                        ? expectedCashAmount.toFixed(2)
                        : "N/A"}
                    </td>
                    <td>{isNaN(total) ? "N/A" : total.toFixed(2)}</td>
                    <td>{isNaN(difference) ? "N/A" : difference.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </Box>
  );
};

export default ShiftPage;
