import React from "react";
import Typewriter from "typewriter-effect";

export default function SideWindow() {
    return (
        <>
            <div className="profileGroup">
                <a href="/">
                    <div className="profileThing bg-cyan h-full aspect-square"></div>
                </a>
                <div className="profileThing">
                    <h1 className="text-4xl">
                        <Typewriter
                            options={{
                                strings: "hexcyan",
                                autoStart: true,
                                cursor: "█",
                            }}
                        />
                    </h1>
                </div>
            </div>
            

            <article className="">
                <h2>Recent</h2>
            </article>
        </>
    );
}
