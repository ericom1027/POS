import React, { useState, useEffect, useRef } from "react";
import Sidenav from "../components/Sidenav";
import Box from "@mui/material/Box";
import { Table, Button } from "react-bootstrap";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import DatePicker from "react-datepicker";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function DailySales() {
  const [dailySales, setDailySales] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const timestamp = selectedDate.getTime();
        // console.log("Timestamp sent to backend:", timestamp);
        const response = await axios.get(
          "https://pos-3j4q.onrender.com/bills/daily-sales",
          {
            params: {
              createdAt: timestamp,
            },
          }
        );

        setDailySales(response.data);
      } catch (error) {
        console.error("Error fetching daily sales:", error);
      }
    };

    fetchDailySales();
  }, [selectedDate]);

  useEffect(() => {
    calculateTotalSales();
  }, [dailySales]);

  const calculateTotalSales = () => {
    const total = dailySales
      .filter((sale) => !sale.voided)
      .reduce((acc, sale) => acc + sale.totalAmount, 0);
    setTotalSales(total);
  };

  const paginate = (page) => {
    setCurrentPage(page);
  };

  const componentRef = useRef();
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
        <div className="date-picker-container">
          <div className="date-picker">
            <div>
              <label>Date:</label>
              <DatePicker
                placeholderText="Select Date"
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="form-control"
                maxDate={new Date()}
              />
            </div>
          </div>
        </div>
        <div>
          <Button
            variant="success"
            onClick={handlePrint}
            className="d-flex ms-auto"
          >
            Print
          </Button>
          <div className="container-fluid" ref={componentRef}>
            <h4 className="mt-3 text-center">Daily Sales Report</h4>
            <Table className="mt-2" striped bordered hover>
              <thead className="text-center">
                <tr>
                  <th>Date Order</th>
                  <th>Customer</th>
                  <th>Invoice Number</th>
                  <th>Vatable</th>
                  <th>VAT</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {dailySales.length > 0 ? (
                  currentItems.map((sale) =>
                    !sale.voided ? (
                      <tr key={sale._id}>
                        {/* <td>
                          {sale.cartItems &&
                            sale.cartItems.map((item, idx) => (
                              <div key={idx}>
                                {item.item} - Qty: {item.qty} - Price:{" "}
                                {item.price.toFixed(2)}
                              </div>
                            ))}
                        </td> */}
                        <td>{new Date(sale.createdAt).toLocaleString()}</td>
                        <td>{sale.customer}</td>
                        <td>{sale.invoiceNumber}</td>
                        <td>{sale.vatSales}</td>
                        <td>{sale.vatAmount}</td>
                        <td>{sale.totalAmount.toFixed(2)}</td>
                      </tr>
                    ) : null
                  )
                ) : (
                  <tr>
                    <td colSpan="6">No sales for the selected date.</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="text-end">
                    Grand Total:
                  </td>
                  <td>{totalSales.toFixed(2)}</td>
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
      </div>
    </Box>
  );
}

export default DailySales;
