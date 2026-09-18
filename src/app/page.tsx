"use client";

import { useState } from "react";

type EventItem = {
  id: number;
  name: string;
  organizer: string;
  area: string;
  city: string;
  address: string;
  time: string;
  date: string;
  status: "Active Now" | "Upcoming" | "Ended";
  distance: string;
  interested: number;
};