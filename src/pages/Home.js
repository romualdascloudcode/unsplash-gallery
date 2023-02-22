import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ImageList from "../components/ImageList";
import SearchBar from "../components/SearchBar";
import Loader from "../helpers/Loader";
import { useAppContext } from "../context/appContext";

function Home() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("forest");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);
  const { token, username, getUserProfile, getToken } = useAppContext();

  const clientId = process.env.REACT_APP_UNSPLASH_KEY;

  useEffect(() => {
    if (window.location.search.includes("code=") && !token) {
      getToken();
    }

    if (token && !username) {
      getUserProfile();
    }
  }, [token]);

  const fetchImages = () => {
    setLoading(true);

    let params = {
      page: page,
      query: query,
      per_page: 30,
    };

    let headers = {};

    if (username) {
      headers = {
        Authorization: `Bearer ${token}`,
      };
    } else {
      params = { ...params, client_id: clientId };
    }

    axios
      .get("https://api.unsplash.com/search/photos", {
        headers,
        params,
        signal: abortControllerRef.current.signal,
      })
      .then((response) => {
        setImages([...images, ...response.data.results]);
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          console.log("Error:", error);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    setPage(page + 1);
  };

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const fetchData = () => {
      fetchImages();
      setQuery("");
    };
    fetchData();
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  return (
    <div>
      <SearchBar
        fetchImages={fetchImages}
        query={query}
        setQuery={setQuery}
        setImages={setImages}
        setPage={setPage}
      />

      {loading && <Loader />}
      <ImageList
        images={images}
        setImages={setImages}
        fetchImages={fetchImages}
      />
    </div>
  );
}

export default Home;
