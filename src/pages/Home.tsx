import React from "react";
import {Header} from "../components/Header";
import {SideBar} from "../components/SideBar";
import {Content} from "../components/Content";

export function Home() {

    // onContextMenu={event => event.preventDefault()}
    return (
        <div >
            <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
                <Header />
            </header>

            <main className="flex-grow mx-auto px-4 py-8 flex">
                <div className="fixed top-32 left-8 w-64 h-[calc(100vh-4rem)] overflow-y-auto">
                    <SideBar />
                </div>
                <div className="flex-grow ml-[7rem] mt-[5rem]">
                    <Content />
                </div>
            </main>
        </div>
    );
}