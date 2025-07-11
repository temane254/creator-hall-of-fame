import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Award, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Successful entrepreneurs"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />
        </div>
        
        <div className="relative z-10 text-center text-primary-foreground max-w-4xl px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Job Creators
            <span className="block text-gold">Hall of Fame</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Celebrating visionary entrepreneurs who create opportunities, drive innovation, and transform communities through their businesses.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/nominate">
              <Button variant="gold" size="lg" className="text-lg px-8 py-6">
                Nominate an Entrepreneur
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
            
            <Link to="/entrepreneurs">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                View Featured Entrepreneurs
                <Users className="ml-2" />
              </Button>
            </Link>
            
            {/* <Link to="/auth">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/30">
                Admin Login
                <ArrowRight className="ml-2" />
              </Button>
            </Link> */}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Honoring Business Leaders Who Make a Difference
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform recognizes entrepreneurs who have created meaningful employment opportunities and built thriving businesses that strengthen their communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center shadow-card hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-hero rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Job Creation</h3>
              <p className="text-muted-foreground">
                Recognizing entrepreneurs who have created at least 3 jobs, contributing to economic growth and community development.
              </p>
            </Card>

            <Card className="p-8 text-center shadow-card hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-gold rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Physical Presence</h3>
              <p className="text-muted-foreground">
                Celebrating businesses with physical locations that serve as anchors in their communities and create local economic impact.
              </p>
            </Card>

            <Card className="p-8 text-center shadow-card hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-hero rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Recognition</h3>
              <p className="text-muted-foreground">
                Providing a platform to honor and showcase the achievements of entrepreneurs who are making a positive difference.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Know a Job Creator Who Deserves Recognition?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Help us celebrate entrepreneurs who are making a difference in their communities. Your nomination could shine a spotlight on someone changing the world.
          </p>
          
          <Link to="/nominate">
            <Button variant="gold" size="lg" className="text-lg px-8 py-6">
              Submit Your Nomination
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;