import React from "react";
import { useState } from "react";
import { SiGithub, SiYoutube } from "@icons-pack/react-simple-icons";
import Typewriter from "typewriter-effect";
import './card.css'

export default function Card() {
    const [hover, setHover] = useState<string>("cyan");

    const mouseEnterHandler = (itemColor: string) => {
        setHover(itemColor);
    };

    const mouseLeaveHandler = () => {
        setHover("cyan");
    };

    return (
        <div className="cardContainer">
            <div className="cardSquare"></div>
            <div className="cardBody">
                <div className="cardHeader">
                    <h1>
                        <Typewriter
                            options={{
                                strings: "hexcyan",
                                autoStart: true,
                                cursor: "█",
                            }}
                        />
                    </h1>
                    <div onMouseEnter={() => mouseEnterHandler("white")} onMouseLeave={mouseLeaveHandler} className="flex flex-row space-x-2">
                        <SiGithub className="cardLinks"/>
                        <SiYoutube className="cardLinks"/> 
                    </div>
                </div>
                <div className="ml-2 space-y-1 mt-2">
                    <h2 onMouseEnter={() => mouseEnterHandler("magenta")} onMouseLeave={mouseLeaveHandler} className="transition-colors duration-500 hover:text-magenta">&gt;projects</h2>
                    <h2 onMouseEnter={() => mouseEnterHandler("yellow")} onMouseLeave={mouseLeaveHandler} className="transition-colors duration-500 hover:text-yellow">&gt;blog</h2>
                </div>
            </div>

        </div>
    );
}