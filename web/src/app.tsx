import React from "react";
import bg from "./assets/bg.png";
import Card from "./components/card";
import SideCard from "./components/sideCard";
import SideWindow from "./components/window";

function App() {
    return (
        <div style={{  
            backgroundImage: "url(" + bg + ")",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            height: '100vh',
            width: '100vw',
            display: "flex",
            justifyContent: "center",
            placeItems: "center",
            backgroundColor: '#2B84F9'
        }}>
            {/* <Card /> */}
            {/* <SideCard /> */}
            <SideWindow />
        </div>
    );
}

export default App;