import React from "react";
import Typewriter from "typewriter-effect";
import "./sideCard.css";
import Buttons from "./buttons";

export default function SideWindow() {
    return (
        <div className="sideGroup">
            <div className="profileGroup">
                <div className="profileHeader">
                    <a href="/" className="profileSquare"></a>
                    <h1 className="profileName">
                        <Typewriter
                            options={{
                                strings: "hexcyan",
                                autoStart: true,
                                cursor: "█",
                            }}
                            />
                    </h1>
                </div>
            
                <article className="profileNews ">
                    <h2>Recent</h2>
                </article>
            </div>
            <Buttons />
        </div>
    );
}
