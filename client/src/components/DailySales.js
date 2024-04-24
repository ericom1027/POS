import React, { useState, useEffect } from "react";
import axios from "axios";

function DailySales() {
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const selectedDate = new Date();
        const timestamp = selectedDate.getTime();
        const response = await axios.get(
          "https://pos-cbfa.onrender./bills/day-sales",
          {
            params: {
              createdAt: timestamp,
            },
          }
        );
        const dailySales = response.data;
        const total = dailySales
          .filter((sale) => !sale.voided)
          .reduce((acc, sale) => acc + sale.totalAmount, 0);
        setTotalSales(total);
      } catch (error) {
        console.error("Error fetching daily sales:", error);
      }
    };

    fetchDailySales();
  }, []);

  return (
    <div>
      <h5>PHP {totalSales.toFixed(2)}</h5>
      <p>Total Sales for the Day</p>
    </div>
  );
}

export default DailySales;
