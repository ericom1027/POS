import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Button, Form } from "react-bootstrap";

import UserContext from "../UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ShiftPage = () => {
  const [newShift, setNewShift] = useState({ firstName: "", startingCash: "" });
  const [closingShift, setClosingShift] = useState({ endingCash: "" });
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const toastOptions = {
    autoClose: 900,
    pauseOnHover: true,
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      axios
        .get(`https://pos-cbfa.onrender.com/shifts/getShift`, {
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
        "https://pos-cbfa.onrender.com/shifts/openShift",
        { firstName: user.firstName, startingCash: newShift.startingCash },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Shift opened successfully!", toastOptions);
      setNewShift({ firstName: "", startingCash: "" });
      // Redirect to home page after opening shift
      navigate("/home");
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
        "https://pos-cbfa.onrender.com/shifts/closeShift",
        { firstName: user.firstName, endingCash: closingShift.endingCash },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Shift closed successfully!", toastOptions);
      setClosingShift({ endingCash: "" });
      // Redirect to home page after closing shift
      navigate("/logout");
    } catch (error) {
      toast.error(
        "You need to open a shift before closing it:",
        error,
        toastOptions
      );
    }
  };

  const handleNavigateToLogin = () => {
    navigate("/logout");
  };

  // Determine if shift is open or closed
  const isShiftOpen = !!(newShift.startingCash && !closingShift.endingCash);
  return (
    <div className="Shift-Form">
      <div className="shift-border">
        <Form className="mt-4 text-center">
          <h4>Open Shift</h4>
          <Form.Group className="mb-2">
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
          {isShiftOpen ? (
            // Render button to open shift
            <Button variant="primary" onClick={handleOpenShift}>
              Open Shift
            </Button>
          ) : (
            // Render disabled button if shift is already open
            <Button variant="primary" disabled>
              Shift Opened
            </Button>
          )}
        </Form>

        <Form className="mt-4 text-center">
          <h4>Close Shift</h4>
          <Form.Group className="mb-2">
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
          {isShiftOpen ? (
            // Render disabled button if shift is not open
            <Button variant="primary" disabled>
              Shift Not Opened
            </Button>
          ) : (
            // Render button to close shift
            <Button variant="primary" onClick={handleCloseShift}>
              Close Shift
            </Button>
          )}
        </Form>
        <p className="text-center">
          Go back to <span onClick={handleNavigateToLogin}>Login page</span>
        </p>
      </div>
    </div>
  );
};

export default ShiftPage;
