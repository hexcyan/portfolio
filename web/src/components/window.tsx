import React from "react";
import daniel_happy from "../assets/daniel_happy.png";
import min from "../assets/min.png";
import max from "../assets/max.png";
import close from "../assets/close.png";
import "./window.css";

export default function SideWindow() {
    return (
        <>
            <div className="sideWindow">
                <div className="titleBar">
                    <img src={daniel_happy} alt="daniel_happy"/>
                    <p className="titleThing">lets go gamers</p>
                    <div className="buttons titleThing">
                        <img className="button" src={min} alt="min" />
                        <img className="button" src={max} alt="max" />
                        <img className="button"src={close} alt="close" />
                    </div>
                </div>
            
                <nav>
                    <ul className="navBar">
                        <a className="navButton" href="/projects"><li>projects</li></a>
                        <a className="navButton" href="/blog" ><li>blog</li></a>
                        <a className="navButton" href="/about" ><li>about</li></a>
                        <a className="navButton" href="/now" ><li>now</li></a>
                    </ul>
                </nav>

                <article className="contentBox">
                    <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque quis lorem eros. Mauris tincidunt ipsum id sem pellentesque vulputate a at dui. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                    </p>
                </article>

                <footer className="titleBar">
                    <p>made with 🤍</p>
                </footer>
            </div>
        </>
    );
}
