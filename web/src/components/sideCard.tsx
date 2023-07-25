import React from "react";
import Typewriter from "typewriter-effect";


export default function SideWindow() {
    return (
        <>
            <div className="group">
                <div className="titleBar">
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
            

                <article className="">
                    <h2>Recent</h2>
                </article>
            </div>
        </>
    );
}
