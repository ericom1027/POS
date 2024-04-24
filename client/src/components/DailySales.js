import React, { useState, useEffect } from "react";
import axios from "axios";

function DailySales() {
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        // Get the current date and format it as "YYYY-MM-DD"
        const currentDate = new Date().toISOString().split("T")[0];

        // Make a GET request to fetch the daily sales
        const response = await axios.get(
          "https://pos-cbfa.onrender./bills/day-sales",
          {
            params: {
              startOfDay: currentDate,
              endOfDay: currentDate,
            },
          }
        );

        // Extract daily sales data from the response
        const dailySales = response.data.dailySales;

        // Calculate total sales from the daily sales data
        let total = 0;
        for (const date in dailySales) {
          total += dailySales[date];
        }

        // Update state with the total sales
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
