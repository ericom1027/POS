import React from "react";
import Button from "react-bootstrap/Button";
import { useDispatch } from "react-redux";
import { Card } from "react-bootstrap";
import { toast } from "react-toastify";

const ItemList = ({ item }) => {
  const formattedPrice = item.price.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
  const dispatch = useDispatch();

  const toastOptions = {
    autoClose: 800,
    pauseOnHover: true,
  };

  //Update cart handler
  const handleAddToCart = () => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { ...item, quantity: 1 },
    });
    toast.success(`${item.name} Added to Cart!`, {
      ...toastOptions,
    });
  };

  return (
    <div className="mb-4 py-2  d-flex text-center justify-content-between">
      <Card className="custom-card mt-5 ">
        <Card.Img className="custom-card-img" variant="top" src={item.image} />
        <Card.Body>
          <Card.Title>{item.name}</Card.Title>
          <Card.Text>{item.size}</Card.Text>
          <Card.Text>{formattedPrice}</Card.Text>
          <Button
            onClick={() => handleAddToCart()}
            className="w-100"
            variant="success"
            id="btn"
          >
            Add to Cart
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ItemList;
