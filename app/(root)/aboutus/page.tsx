"use client"

import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';


const page = () => {
  const email = 'banyanbonds@banyanbonds.com'; // Email address to copy to clipboard
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    //alert('Email copied to clipboard!');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000); // Hide the message after 2 seconds
  };

  return (
    <div>
      <section className="mt-9 flex flex-col gap-10">
        <h2 className='head-text text-left'>Welcome to BanyanBonds</h2>
        <p>
          In the heart of every word lies a deeper connection, a bridge that extends 
          towards understanding, empathy, and unity. At BanyanBonds, we embrace the power 
          of language to weave these connections, creating a canopy under which every voice 
          finds a place, every thought a sanctuary.
        </p>
        <h2 className='head-text text-left'>Our Vision</h2>
        <p>
        Inspired by the majestic Banyan tree, known for its vast, sheltering presence and 
        interlocking roots, BanyanBonds aspires to be a digital sanctuary where thoughts 
        intertwine and support each other in a display of strength, growth, and unity. 
        Our platform champions the timeless art of conversation, poetry, and storytelling, 
        fostering an environment where language thrives in its purest form.
        </p>
        <h2 className='head-text text-left'>
          Our Commitment to Privacy and Authenticity
        </h2>
        <p>
        We believe in creating a space free from the distractions of modern digital life — 
        no advertisements, no data harvesting, just pure, unadulterated communication. 
        BanyanBonds is a return to the basics, where the content speaks louder than the number 
        of likes or shares, and where privacy is paramount.
        </p>
        <h2 className='head-text text -left'>
          Join Us
        </h2>
        <p>
          Whether you're a poet at heart, a lover of languages, or someone who cherishes deep, 
          meaningful conversations, BanyanBonds welcomes you. Join our community and be a part 
          of a growing movement to bring back the richness of human connection, one word at a 
          time.

          Together, under the vast canopy of our collective words and wisdom, let's make every 
          connection count. Welcome to BanyanBonds, where every word plants a seed of unity.
        </p>
      </section>
      <div className="mt-12">
        <h2 className="head-text text-left">Contact Us</h2>
        <CopyToClipboard text={email} onCopy={handleCopy}>
          <a href={`mailto:${email}`} className="text-blue-500 hover:underline">
            {email}
          </a>
        </CopyToClipboard>
        {copied && <p className="text-green-500">Email copied to clipboard!</p>}
      </div>
    </div>
  )
}

export default page;