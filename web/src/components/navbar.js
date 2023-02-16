import React from 'react'
import { Github, Youtube } from '@icons-pack/react-simple-icons';

function Navbar() {
  return (
    <div class="h-fit rounded-xl border-white border-2 drop-shadow-[0_0_16px_#00FFFF66]">
        <div class="rounded-t-xl bg-cyan w-full aspect-square"></div>
        <div class="rounded-b-xl text-cyan bg-dark p-8 ">
            <div class="flex flex-row justify-between items-center">
               <h1 class="text-4xl">hexcyan</h1>
               <div class="flex flex-row space-x-2">
                <Github />
                <Youtube /> 
               </div>
            </div>
            <div class="ml-2">
                <h2>&gt;projects</h2>
                <h2>&gt;blog</h2>
            </div>
        </div>

    </div>
  )
}

export default Navbar