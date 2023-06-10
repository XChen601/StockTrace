import { useEffect, useState } from "react";
import { addToDatabase, getUserFavorites, getUserName } from "../Firebase";
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-react-ui-kit";
import "../css/StockInfoModal.css";

export default function StockInfoModal({
  stockName,
  setFavorites,
  modalVisibility,
  toggleShow,
  setModalVisibility,
}) {
  const [stockInfo, setStockInfo] = useState({});

  async function addToFavorites() {
    await addToDatabase(stockName, stockInfo.ask);
    const userFavoriteList = await getUserFavorites(getUserName());
    setFavorites(userFavoriteList);
  }

  const setNotFound = () => {
    setStockInfo({
      symbol: "Not Found",
      description: "Not Found",
      ask: "Not Found",
      change_percentage: "Not Found",
    });
  };

  useEffect(() => {
    async function fetchStockInfo(symbol) {
      const tradierToken = process.env.REACT_APP_TRADIER_TOKEN;
      try {
        const response = await fetch(
          `https://api.tradier.com/v1/markets/quotes?symbols=${symbol}&greeks=false`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tradierToken}`,
              Accept: "application/json",
            },
          }
        );
        const stocksData = await response.json();
        if (stocksData.quotes.quote === undefined) {
          setNotFound();
          return;
        }
        setStockInfo(stocksData.quotes.quote);
        return stocksData.quotes.quote;
      } catch (error) {
        setNotFound();
      }
    }
    fetchStockInfo(stockName);
  }, [stockName]);
  return (
    <div>
      <MDBModal
        show={modalVisibility}
        setShow={setModalVisibility}
        tabIndex="-1"
      >
        <MDBModalDialog centered>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Stock Information:</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={toggleShow}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <h4>Ticker: {stockInfo.symbol}</h4>
              <div>{stockInfo.description}</div>
              <div>Price: {stockInfo.ask}</div>
              <div>Day Change: {stockInfo.change_percentage}%</div>
            </MDBModalBody>

            <MDBModalFooter>
              <button className="favorite-btn" onClick={addToFavorites}>
                Favorite!
              </button>
              <button className="close-btn" onClick={toggleShow}>
                Close
              </button>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
}