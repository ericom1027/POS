import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidenav from "../components/Sidenav";
import Box from "@mui/material/Box";
import { Button, Table } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DatePicker from "react-datepicker";

const TotalSoldItem = () => {
  const [dailySales, setDailySales] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [grandTotal, setGrandTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const componentRef = useRef();

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        // Set the selected date to start and end of the day
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch daily sales for the selected date
        const response = await axios.post(
          "https://pos-cbfa.onrender.com/bills/sales",
          {
            startOfDay: startOfDay.toISOString(),
            endOfDay: endOfDay.toISOString(),
          }
        );
        console.log("Daily Sales Data:", response.data.data);
        setDailySales(response.data.data);
      } catch (error) {
        console.error("Error fetching daily sales:", error);
      }
    };

    fetchDailySales();
  }, [selectedDate]);

  useEffect(() => {
    const total = dailySales.reduce(
      (accumulator, sale) => accumulator + sale.totalPrice,
      0
    );
    setGrandTotal(total);
  }, [dailySales]);

  const paginate = (page) => {
    setCurrentPage(page);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dailySales.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />

      <div className="w-100 py-5 mt-5 mb-5 p-3">
        <Button
          className="d-flex ms-auto"
          variant="success"
          onClick={handlePrint}
        >
          Print
        </Button>
        <div className="date-picker">
          <div>
            <label>
              Date:
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="form-control"
                maxDate={new Date()}
              />
            </label>
          </div>
        </div>
        <div className="container-fluid" ref={componentRef}>
          <h4>Daily Total Sold Item by Employee</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date Order</th>
                <th>Time</th>
                <th>Cashier Name</th>
                <th>Item</th>
                <th>Price</th>
                <th>Total Quantity</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((sale, index) => (
                <tr key={index}>
                  <td>
                    {new Date(sale.createdAt).toLocaleString("en-PH", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </td>
                  <td>
                    {new Date(sale.createdAt).toLocaleString("en-PH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td>{sale.cashierName}</td>
                  <td>{sale.item}</td>
                  <td>{sale.price.toFixed(2)}</td>
                  <td>{sale.totalQuantity}</td>
                  <td>{sale.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="6" className="text-end">
                  Grand Total
                </td>
                <td>{grandTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </Table>
        </div>
        <Stack spacing={2} alignItems="flex-end">
          <Pagination
            color="primary"
            count={Math.ceil(dailySales.length / itemsPerPage)}
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

export default TotalSoldItem;
