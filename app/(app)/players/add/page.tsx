import { AddEdit } from "@/components/player"

export default Add

function Add() {
  return (
    <AddEdit
      title="Add Player"
      player={{
        title: "",
        sources: [{ label: "Default", url: "" }],
        playerConfiguration: {},
      }}
    />
  )
}