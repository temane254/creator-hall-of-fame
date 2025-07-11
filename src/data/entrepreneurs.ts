export interface Entrepreneur {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  location: string;
  bio: string;
  phone: string;
  profileImage: string;
  companyLogo?: string;
  employees: number;
  founded: string;
}

export const featuredEntrepreneurs: Entrepreneur[] = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    businessName: "TechFlow Solutions",
    industry: "Technology",
    location: "Austin, Texas, USA",
    bio: "Sarah Johnson is a visionary technology entrepreneur who founded TechFlow Solutions in 2018. With her innovative approach to software development and team management, she has grown her company from a small startup to a thriving business employing over 25 professionals. Her company specializes in custom software solutions for healthcare providers, helping streamline patient care and administrative processes. Sarah's commitment to creating meaningful employment opportunities while solving real-world problems has made her a respected leader in the Austin tech community. Under her leadership, TechFlow Solutions has not only created jobs but also contributed to the digital transformation of healthcare, improving patient outcomes across multiple states.",
    phone: "+1-512-555-0123",
    profileImage: "/src/assets/entrepreneur-1.jpg",
    employees: 25,
    founded: "2018"
  },
  {
    id: "marcus-rodriguez",
    name: "Marcus Rodriguez", 
    businessName: "Green Valley Manufacturing",
    industry: "Manufacturing",
    location: "Denver, Colorado, USA",
    bio: "Marcus Rodriguez is a dedicated manufacturing entrepreneur who established Green Valley Manufacturing in 2015 with a vision of sustainable production and community development. Starting with just 5 employees, Marcus has grown his eco-friendly packaging company to employ over 40 skilled workers in the Denver area. His company produces biodegradable packaging solutions for food and retail industries, contributing to environmental sustainability while creating stable, well-paying jobs. Marcus is passionate about workforce development and has partnered with local technical colleges to provide apprenticeship programs. His commitment to both environmental responsibility and job creation has earned him recognition as a leader in sustainable business practices, proving that profitability and purpose can go hand in hand.",
    phone: "+1-303-555-0456",
    profileImage: "/src/assets/entrepreneur-2.jpg",
    employees: 40,
    founded: "2015"
  },
  {
    id: "aisha-patel",
    name: "Aisha Patel",
    businessName: "Wellness Center Network", 
    industry: "Healthcare",
    location: "Miami, Florida, USA",
    bio: "Dr. Aisha Patel is a healthcare entrepreneur who revolutionized community wellness through her Wellness Center Network, founded in 2017. With a background in family medicine and public health, Aisha identified a gap in accessible healthcare services in underserved communities. Her innovative approach combines traditional medical care with holistic wellness programs, nutrition counseling, and mental health services. Starting with a single clinic, she has expanded to operate four wellness centers across Miami-Dade County, employing over 60 healthcare professionals, administrators, and support staff. Aisha's centers serve thousands of patients annually, many of whom previously lacked access to comprehensive healthcare. Her business model focuses on affordability and prevention, making healthcare accessible while creating sustainable employment for healthcare workers and supporting community health initiatives.",
    phone: "+1-305-555-0789",
    profileImage: "/src/assets/entrepreneur-3.jpg", 
    employees: 60,
    founded: "2017"
  }
];