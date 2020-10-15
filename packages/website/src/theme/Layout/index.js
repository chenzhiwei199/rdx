import OriginalLayout from '@theme-original/Layout'
import React from 'react'
import { WebsiteStyleReset } from './WebsiteStyleReset'

export default function Layout(props) {
  return (
    <>
      <OriginalLayout {...props} />
      <WebsiteStyleReset />
    </>
  )
}