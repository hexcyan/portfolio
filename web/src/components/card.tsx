import React from 'react'
import { Sigithub, Siyoutube } from '@icons-pack/react-simple-icons';
import Typewriter from 'typewriter-effect';


class Card extends React.Component {

  render() {
    return (
      <div className="flex flex-auto flex-col min-w-md max-w-lg m-20 h-fit drop-shadow-[0_0_24px_cyan]">
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
              <div className="flex flex-row space-x-2">
                <Sigithub className="transition-colors hover:text-white"/>
                <Siyoutube className="transition-colors hover:text-white"/> 
              </div>
            </div>
            <div className="ml-2 space-y-1 mt-2">
                <h2 className="transition-colors hover:text-magenta">&gt;projects</h2>
                <h2 className="transition-colors hover:text-yellow">&gt;blog</h2>
            </div>
        </div>

    </div>
    )
  }
}

export default Card