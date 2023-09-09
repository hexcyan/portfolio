import React from "react";
import bg from "./assets/bg.png";
import Card from "./components/card";
import SideCard from "./components/sideCard";
import SideWindow from "./components/window";
import './app.css'

function App() {
    return (
        <div className="cardBackground">
            <Card />
        </div>
        // <div className="appBackground">
        //     <div className="appContainer">
        //         <SideCard />
        //         <SideWindow />
        //     </div>
        // </div>
    );
}

export default App;