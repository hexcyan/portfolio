import React from "react";
// import bg from "./assets/bg.png";
import Card from "./components/card";
import SideCard from "./components/sideCard";
import SideWindow from "./components/window";
function App() {
    return (
        <div className="bg-[url('./assets/bg.png')] bg-no-repeat bg-cover flex shrink-0 h-screen justify-center place-items-center bg-dark">
            {/* <Card /> */}
            <SideCard />
            <SideWindow />
        </div>
    );
}


export default App;