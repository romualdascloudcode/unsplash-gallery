import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ImageList from "../components/ImageList";
import AboutHeader from "../components/AboutHeader";
import Loader from "../helpers/Loader";
import { useAppContext } from "../context/appContext";

function About() {
  const { token, username } = useAppContext();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const abortControllerRefAbout = useRef(null);

  const fetchImages = () => {
    setLoading(true);

    let params = {
      page,
      per_page: 20,
    };

    let headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    axios
      .get(`https://api.unsplash.com/users/${username}/likes`, {
        headers,
        params,
        signal: abortControllerRefAbout.current.signal,
      })
      .then((response) => {
        setImages([...images, ...response.data]);
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
    abortControllerRefAbout.current = new AbortController();
    fetchImages();

    return () => {
      abortControllerRefAbout.current.abort();
    };
  }, []);

  return (
    <div>
      <AboutHeader />
      {loading && <Loader />}
      <ImageList images={images} fetchImages={fetchImages} />
    </div>
  );
}

export default About;
