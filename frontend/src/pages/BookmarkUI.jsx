import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useCookies } from "react-cookie";
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import { IoNavigate } from "react-icons/io5";
import "./style.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
const backend_url = process.env.REACT_APP_BACKEND_URL;

const Bookmarks = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [cookies] = useCookies(["user"]);
  const uid = cookies.user;
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [bookmarkName, setBookmarkName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const initializeMap = () => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [103.8198, 1.3521],
      zoom: 11,
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: "Enter destination",
      className: "custom-geocoder",
    });

    map.current.addControl(geocoder);
    map.current.addControl(geolocate);
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      geolocate.trigger();
    });

    geocoder.on("result", (e) => {
      setSelectedLocation({
        name: e.result.place_name,
        coordinates: e.result.center,
      });
      setLocationError(false); // Clear location error when a location is selected
    });
  };

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get(backend_url + "/bookmarks", {
        params: {
          uid: uid,
        },
      });
      setBookmarks(response.data);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const deleteBookmark = async (location) => {
    try {
      await axios.post(backend_url + "/bookmarks/delete", {
        location: location[0],
        uid: uid,
      });
      setBookmarks((prevBookmarks) =>
        prevBookmarks.filter((bookmark) => bookmark !== location),
      );
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  const handleNavigate = (coordinates) => {
    navigate("/navigation", {
      state: {
        coordinates: coordinates,
        timestamp: Date.now(),
      },
      replace: true,
    });
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setTimeout(initializeMap, 100);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setBookmarkName("");
    setSelectedLocation(null);
    setNameError(false);
    setLocationError(false);
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
  };

  useEffect(() => {
    fetchBookmarks();
    console.log("bookmarks:", bookmarks); // Add this
  }, []);

  const handleAddBookmark = async () => {
    if (!bookmarkName.trim()) {
      setNameError(true);
      return;
    }
    if (!selectedLocation) {
      setLocationError(true);
      return;
    }

    try {
      await axios.post(backend_url + "/bookmarks/add", {
        uid: uid,
        name: bookmarkName.trim(),
        location: selectedLocation.name,
        coordinates: selectedLocation.coordinates,
      });

      setBookmarks((prevBookmarks) => [
        ...prevBookmarks,
        [
          bookmarkName, // name
          selectedLocation.name, // location
          selectedLocation.coordinates[0], // latitude
          selectedLocation.coordinates[1], // longitude
        ],
      ]);
      setNameError(false);
      setLocationError(false);
      handleCloseDialog();
    } catch (error) {
      console.error("Error adding bookmark:", error);
      console.log(error.response);
    }
  };

  return (
    <div className="page" style={{ background: "#fcfcfc" }}>
      <div className="top-bar" style={{ position: "relative" }}>
        <IconButton
          component={Link}
          to="/navigation"
          edge="start"
          color="inherit"
          aria-label="back"
          style={{ position: "absolute", left: 10 }}
        >
          <IoIosArrowBack size={24} />
        </IconButton>
        <h1 style={{ textAlign: "center" }}>Bookmarks</h1>
      </div>

      <Divider style={{ margin: "16px 0" }} />
      <h3>
        <br />
        My Bookmarks
      </h3>

      <List className="bookmark-list">
        {bookmarks.map((bookmark, index) => (
          <React.Fragment key={index}>
            <ListItem button className="bookmark-box">
              <ListItemText
                primary={bookmark[0]} // This gets the name from the database
                secondary={bookmark[1]} // This gets the location from the database
                primaryTypographyProps={{
                  style: {
                    fontWeight: 500,
                    marginBottom: "4px",
                  },
                }}
                secondaryTypographyProps={{
                  style: {
                    fontSize: "0.875rem",
                    color: "rgba(0, 0, 0, 0.6)",
                  },
                }}
              />
              <IconButton
                onClick={() => handleNavigate([bookmark[2], bookmark[3]])}
                sx={{ color: "#1976d2" }}
              >
                <IoNavigate />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => deleteBookmark(bookmark)}
                color="error"
              >
                <DeleteOutline />
              </IconButton>
            </ListItem>
          </React.Fragment>
        ))}
      </List>

      <Button
        variant="outlined"
        sx={{
          width: "95%",
          height: "50px",
          margin: "20px auto",
          display: "block",
          color: "#1976d2",
          borderColor: "#1976d2",
          borderRadius: "8px",
          fontSize: "0.9rem",
          backgroundColor: "white",
          borderWidth: "2px",
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.2)",
            borderColor: "#1976d2",
          },
        }}
        onClick={handleOpenDialog}
      >
        Add a bookmark
      </Button>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "16px",
            margin: "16px",
            animation: "slideUp 300ms ease-out",
            maxHeight: "100%", // Add this
            width: "450px",
            overflow: "hidden", // Add this
          },
        }}
        TransitionProps={{
          timeout: 300,
        }}
        sx={{
          "& .MuiDialog-paper": {
            "@keyframes slideUp": {
              from: {
                transform: "translateY(100%)",
                opacity: 0,
              },
              to: {
                transform: "translateY(0)",
                opacity: 1,
              },
            },
          },
        }}
      >
        <DialogTitle>Add a New Bookmark</DialogTitle>
        <DialogContent>
          <div
            className="mapContainer"
            ref={mapContainer}
            style={{ height: "400px", marginBottom: "16px" }}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={bookmarkName}
            onChange={(e) => {
              setBookmarkName(e.target.value);
              setNameError(false); // Clear error when user types
            }}
            placeholder="Enter bookmark name"
            error={nameError}
            helperText={nameError ? "Name cannot be empty" : ""}
            required
          />
          <TextField
            margin="dense"
            label="Location"
            type="text"
            fullWidth
            value={selectedLocation?.name || ""}
            disabled
            error={locationError}
            InputProps={{
              readOnly: true,
              style: {
                backgroundColor: "#f5f5f5",
                cursor: "not-allowed",
              },
            }}
            helperText={
              locationError
                ? "Please select a location from the map"
                : "Please use the map search to select a location"
            }
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleAddBookmark}
            color="primary"
            disabled={!selectedLocation}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Bookmarks;
