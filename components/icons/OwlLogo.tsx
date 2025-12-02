import React from 'react';

export const OwlLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md shrink-0">
    {/* Body */}
    <path d="M50 95C75 95 90 80 95 60C98 48 95 30 85 15L75 5L60 15C55 12 45 12 40 15L25 5L15 15C5 30 2 48 5 60C10 80 25 95 50 95Z" fill="#519554" stroke="#2d5e30" strokeWidth="3"/>
    {/* Wings */}
    <path d="M10 50C5 60 15 80 30 85" stroke="#3a7a3e" strokeWidth="4" strokeLinecap="round"/>
    <path d="M90 50C95 60 85 80 70 85" stroke="#3a7a3e" strokeWidth="4" strokeLinecap="round"/>
    {/* Eyes Background */}
    <circle cx="35" cy="45" r="14" fill="#D2E882"/>
    <circle cx="65" cy="45" r="14" fill="#D2E882"/>
    {/* Pupils */}
    <circle cx="35" cy="45" r="6" fill="#1a381d"/>
    <circle cx="65" cy="45" r="6" fill="#1a381d"/>
    {/* Eyebrows */}
    <path d="M25 32L45 38" stroke="#1a381d" strokeWidth="4" strokeLinecap="round"/>
    <path d="M75 32L55 38" stroke="#1a381d" strokeWidth="4" strokeLinecap="round"/>
    {/* Beak */}
    <path d="M50 50L45 60H55L50 50Z" fill="#FACC15" />
  </svg>
);