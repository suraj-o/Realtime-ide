"use client"

import { Socket } from "socket.io-client";
import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import Avatar from 'react-avatar'
import { useSearchParams , useParams , useRouter } from 'next/navigation'
import { ACTIONS } from "@/constant";
import toast from "react-hot-toast";

type Props = {

        socket: Socket;

}

interface IMember {
    socketId: string | number
    username: string
}

function Sidebar ({socket} : Props) {

    const [members, setMembers] = useState<IMember[]>([])
    const router = useRouter()
    const searchParams = useSearchParams()
    const {roomId} = useParams()
    const username = searchParams.get('username')

    const copyToClipboard = () => {
        navigator.clipboard.writeText(String(roomId)).then(
          () => {
            console.log("Text copied to clipboard");
            toast.success("Copied to clipboard!");
          },
          (err) => {
            toast.error("Could not copy text: ", err);
          }
        );
      };

      function leaveRoom() {
          window.location.replace("/")
          router.replace('/');

        socket.on(ACTIONS.DISCONNECTED , ({socketId , username}) => {
            toast.success(`${username} left the room`)
            setMembers((prev) => {
                return prev.filter((client) => client.socketId !== socketId)

            })})
    }


    useEffect(() => {
        socket.emit(ACTIONS.JOIN , {username , roomId} )
        socket.on(ACTIONS.JOINED , ({allClients , username , socketId}) => {

            toast.success(`${username} joined the room`)
            setMembers(allClients)
        })

    // Listening for disconnect
    socket.on(ACTIONS.DISCONNECTED , ({socketId , username}) => {
        toast.success(`${username} left the room`)
        setMembers((prev) => {
            return prev.filter((client) => client.socketId !== socketId)

        })
    })

    },[])



    return (
        <Card className='w-[200px] h-screen flex flex-col'>
            <div className='flex-grow'>
                <CardHeader>
                    <CardTitle>Real Time IDE</CardTitle>
                    <CardDescription>Members</CardDescription>
                </CardHeader>

                <CardContent className='flex flex-wrap justify-center gap-2 overflow-y-auto max-h-[calc(100vh-340px)]'>
                    {members && members.length > 0 && members.map((member) => (
                        <MemberComp key={member.socketId} member={member} />
                    ))}
                </CardContent>
            </div>

            <CardFooter className="flex flex-col gap-2 p-4">
                <Button variant="outline" className='w-full' onClick={copyToClipboard} >Copy Room Id</Button>
                <Button className='w-full' onClick={leaveRoom}>Leave Room</Button>
            </CardFooter>
        </Card>
    )
}

export default React.memo(Sidebar);

interface IMemberProp {
    member: IMember
}

const MemberComp = ({ member }: IMemberProp) => {
    return (
        <div className='flex flex-col justify-center items-center'>
            <Avatar name={member?.username} round="50px" size={"50"} />
            <p className='text-xs'>{member?.username}</p>
        </div>
    )
}
