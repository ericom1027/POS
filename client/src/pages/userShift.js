import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import Box from "@mui/material/Box";
import Sidenav from "../components/Sidenav";
import UserContext from "../UserContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ShiftPage = () => {
  const [newShift, setNewShift] = useState({ firstName: "", startingCash: "" });
  const [closingShift, setClosingShift] = useState({ endingCash: "" });
  const { user } = useContext(UserContext);

  const toastOptions = {
    autoClose: 900,
    pauseOnHover: true,
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      axios
        .get(`https://pos-3j4q.onrender.com/shifts/getShift`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => console.log(response.data))
        .catch((error) => toast.error("Error fetching user data:", error));
    }
  }, [user]);

  const handleOpenShift = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found.", toastOptions);
        return;
      }

      await axios.post(
        "https://pos-3j4q.onrender.com/shifts/openShift",
        { firstName: user.firstName, startingCash: newShift.startingCash },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Shift opened successfully!", toastOptions);
      setNewShift({ firstName: "", startingCash: "" });
    } catch (error) {
      toast.error("Error opening shift:", error, toastOptions);
    }
  };

  const handleCloseShift = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found.", toastOptions);
        return;
      }

      await axios.put(
        "https://pos-3j4q.onrender.com/shifts/closeShift",
        { firstName: user.firstName, endingCash: closingShift.endingCash },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Shift closed successfully!", toastOptions);
      setClosingShift({ endingCash: "" });
    } catch (error) {
      toast.error("Error closing shift:", error, toastOptions);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <div className="d-flex mx-auto mt-5 py-5">
        <div className="shift-border">
          <h4>Open Shift</h4>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label>Starting Cash</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Starting Cash"
                value={newShift.startingCash}
                onChange={(e) =>
                  setNewShift({ ...newShift, startingCash: e.target.value })
                }
              />
            </Form.Group>
            <Link to="/home">
              <Button variant="primary" onClick={handleOpenShift}>
                Open Shift
              </Button>
            </Link>
          </Form>
        </div>

        <div className="shift-border">
          <div>
            <h4>Close Shift</h4>
            <Form>
              <Form.Group className="mb-4">
                <Form.Label>Ending Cash</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Ending Cash"
                  value={closingShift.endingCash}
                  onChange={(e) =>
                    setClosingShift({
                      ...closingShift,
                      endingCash: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Link to="/home">
                <Button variant="primary" onClick={handleCloseShift}>
                  Close Shift
                </Button>
              </Link>
            </Form>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default ShiftPage;
