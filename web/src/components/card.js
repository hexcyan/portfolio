import React from 'react'
import { Sigithub, Siyoutube } from '@icons-pack/react-simple-icons';
import Typewriter from 'typewriter-effect';


class Navbar extends React.Component {

  render() {
    return (
      <div class="flex flex-auto flex-col min-w-md max-w-lg m-20 h-fit drop-shadow-[0_0_24px_cyan]">
        <div class="rounded-t-3xl bg-cyan w-full aspect-square "></div>
        <div class="rounded-b-3xl text-cyan bg-dark p-8 ">
            <div class="flex flex-row justify-between items-center">
              <h1 class="text-4xl">
                <Typewriter
                  options={{
                    strings: 'hexcyan',
                    autoStart: true,
                    cursor: '█'
                  }}
                  />
              </h1>
              <div class="flex flex-row space-x-2">
                <Sigithub class="transition-colors hover:text-white"/>
                <Siyoutube class="transition-colors hover:text-white"/> 
              </div>
            </div>
            <div class="ml-2 space-y-1 mt-2">
                <h2 class="transition-colors hover:text-magenta">&gt;projects</h2>
                <h2 class="transition-colors hover:text-yellow">&gt;blog</h2>
            </div>
        </div>

    </div>
    )
  }
}

export default Navbar