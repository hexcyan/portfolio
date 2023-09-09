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
                    <img src={daniel_happy} alt="daniel_happy" className="titleThing" draggable="false"/>
                    <p className="titleThing">lets go gamers</p>
                    <div className="buttons titleThing">
                        <img draggable="false" className="button" src={min} alt="min" />
                        <img draggable="false" className="button" src={max} alt="max" />
                        <img draggable="false" className="button"src={close} alt="close" />
                    </div>
                </div>
            
                <nav>
                    <ul className="navBar">
                        <a className="navButton" href="/projects"><li>projects</li></a>
                        <a className="navButton" href="/blog" ><li>blog</li></a>
                        <a className="navButton" href="/about" ><li>about</li></a>
                        <a className="navButton" href="/card" ><li>card</li></a>
                        <a className="navButton" href="/now" ><li>now</li></a>
                    </ul>
                </nav>

                <article className="contentBox">
                    <h1>Building a Lily45</h1>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eleifend tellus ante. Pellentesque id varius libero. Vivamus tempus lectus ut nisi tincidunt mollis. Integer tristique accumsan iaculis. Etiam hendrerit, elit sit amet tristique commodo, lorem massa congue nisi, ac dapibus ligula nisl vulputate orci. Donec non sapien sit amet nisi luctus blandit ac vel nibh. Proin lacinia imperdiet tempus. Cras sit amet lectus vitae dolor scelerisque laoreet a ut ipsum.
                    </p>

                    <p>
                        Nam luctus finibus lorem, in ornare nibh varius quis. Proin congue dui orci, a vulputate neque dapibus at. Pellentesque lorem ligula, molestie vel tortor nec, iaculis venenatis justo. Quisque a ante ut tellus luctus feugiat. Nam feugiat tellus quis volutpat semper. Mauris sollicitudin congue enim. Nunc hendrerit mi ut augue tincidunt, in egestas est efficitur.
                    </p>

                    <p>
                        Sed et massa hendrerit, cursus metus at, pulvinar urna. Aenean pellentesque pulvinar dolor, eu eleifend diam interdum eu. Sed diam dolor, dapibus a sagittis id, sagittis at elit. Donec ornare est sed lobortis convallis. Nunc venenatis magna pretium tellus maximus, ut vestibulum orci facilisis. Donec lobortis auctor imperdiet. Quisque elementum accumsan feugiat. Donec congue diam lorem, id lobortis purus tempor id. Maecenas auctor porttitor tempus. Cras vel ante id risus rutrum hendrerit non ac quam. Donec elementum massa non felis scelerisque rutrum. Proin elementum quam eget justo blandit, non sagittis quam tempor. Maecenas ante velit, imperdiet eget mattis quis, condimentum ac ipsum.
                    </p>

                    <p>

                        Sed maximus et lacus non laoreet. Aenean fringilla ac neque nec suscipit. Quisque elementum eros ut nunc ultricies, at condimentum nisi tincidunt. Pellentesque non pellentesque nisl, in congue nisl. Duis nec purus efficitur, ornare tortor quis, pulvinar mi. Nulla egestas lorem sed elit vehicula, ultrices tincidunt nisl elementum. Mauris a risus metus. Donec mauris justo, vestibulum vitae commodo quis, tincidunt non sem. Maecenas malesuada consequat imperdiet. Aliquam consequat ex ut enim convallis, hendrerit placerat ipsum pulvinar. Aenean porttitor risus non lectus rhoncus, et accumsan leo tempor. Duis id odio massa. Curabitur lobortis, quam non viverra tempus, ipsum metus dictum purus, et ultricies elit ligula non ex. Pellentesque vestibulum pretium metus eu posuere.
                    </p>

                    <p>
                        Praesent volutpat posuere placerat. Donec odio metus, condimentum quis eros sit amet, dapibus molestie augue. Nulla placerat ipsum leo, et cursus eros fringilla a. Nam id varius erat. Donec rutrum turpis eu tortor pretium eleifend sed tempus felis. Sed tincidunt erat ac ipsum tincidunt, et rhoncus leo convallis. In sit amet eros ut leo egestas iaculis. Sed sodales nunc sapien, sed dictum orci sagittis eget. Donec consectetur maximus sapien ut efficitur. Nam id urna velit. Praesent sollicitudin purus in justo pellentesque, ac porttitor massa condimentum. Suspendisse ut elit metus. Etiam eu molestie nulla. Vestibulum sed mi dignissim, venenatis tellus ut, hendrerit libero. Fusce dapibus orci dui, imperdiet fermentum ante ultrices eget. 
                    </p>
                </article>

                <footer className="titleBar">
                    <p>made with 🤍</p>
                </footer>
            </div>
        </>
    );
}
