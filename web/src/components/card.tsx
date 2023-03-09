import { useState } from 'react'
import { Sigithub, Siyoutube } from '@icons-pack/react-simple-icons';
import Typewriter from 'typewriter-effect';

export default function Card() {
  const [hover, setHover] = useState<string>("cyan");
  
  const mouseEnterHandler = (itemColor: string) => {
    setHover(itemColor);
  }

  const mouseLeaveHandler = () => {
    setHover("cyan");
  }
  
  return (
    <div className={`transition-colors duration-1000 flex flex-auto flex-col min-w-md max-w-lg m-20 h-fit drop-shadow-[0_0_24px_${hover}]`}>
      <div className="rounded-t-3xl bg-cyan w-full aspect-square "></div>
      <div className="rounded-b-3xl text-cyan bg-dark p-8 ">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-4xl">
              <Typewriter
                options={{
                  strings: 'hexcyan',
                  autoStart: true,
                  cursor: '█'
                }}
                />
            </h1>
            <div onMouseEnter={() => mouseEnterHandler("white")} onMouseLeave={mouseLeaveHandler} className="flex flex-row space-x-2">
              <Sigithub className="transition-colors hover:text-white"/>
              <Siyoutube className="transition-colors hover:text-white"/> 
            </div>
          </div>
          <div className="ml-2 space-y-1 mt-2">
              <h2 onMouseEnter={() => mouseEnterHandler("magenta")} onMouseLeave={mouseLeaveHandler} className="transition-colors duration-500 hover:text-magenta">&gt;projects</h2>
              <h2 onMouseEnter={() => mouseEnterHandler("yellow")} onMouseLeave={mouseLeaveHandler} className="transition-colors duration-500 hover:text-yellow">&gt;blog</h2>
          </div>
      </div>

  </div>
  )
}