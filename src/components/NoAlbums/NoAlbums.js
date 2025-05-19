import React from "react";
import "./NoAlbums.css";

function NoAlbums() {
  return (
    <div className="no-albums-message">
      <h2>No albums saved</h2>
      <p>You have no saved albums in your Spotify library.</p>
    </div>
  );
}

export default NoAlbums;
