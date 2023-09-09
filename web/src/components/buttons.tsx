import React from "react";
import "./buttons.css"
import * as buttons from "../assets/buttons/*";

export default function Buttons() {
    return (
        <div className="buttonGrid">
        {
            Object.entries(buttons).map(([filename, url]: any) => (
                <img key={filename} src={url} alt={filename} className="buttonSingle"/>
            ))
        }
        </div>
    )
}