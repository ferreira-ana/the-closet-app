<template>
  <div>
    <Navbar />
    <Hero />
    <About />
    <Features />
    <HowItWorks />
    <CallToAction />
    <Footer />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from "vue";

const Footer = defineAsyncComponent(() => import("@/components/Footer.vue"));
const CallToAction = defineAsyncComponent(() =>
  import("@/components/CallToAction.vue")
);

import Navbar from "@/components/Navbar.vue";
import Hero from "../components/Hero.vue";
import About from "../components/About.vue";
import Features from "../components/Features.vue";
import HowItWorks from "../components/HowItWorks.vue";
</script>
