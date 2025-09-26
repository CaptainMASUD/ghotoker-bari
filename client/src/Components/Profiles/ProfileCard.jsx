import { Card } from "flowbite-react"
import { MapPin, Briefcase, GraduationCap, Shield, Heart } from "lucide-react"

const ProfileCard = ({ profile }) => {
  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={profile.image || "/placeholder.svg"}
          alt={profile.name}
          className="w-full h-64 object-cover rounded-t-lg"
        />
        {profile.verified && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Verified</span>
          </div>
        )}
        <button className="absolute top-2 left-2 bg-background/80 text-foreground p-2 rounded-full hover:bg-background transition-colors">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-playfair text-xl font-bold text-card-foreground">{profile.name}</h3>
          <span className="text-muted-foreground text-sm">{profile.age} years</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{profile.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>{profile.profession}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>{profile.education}</span>
          </div>
        </div>

        <p className="text-card-foreground text-sm mb-4 line-clamp-3">{profile.bio}</p>

        <div className="flex space-x-2">
          <button className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
            View Profile
          </button>
          <button className="flex-1 border border-border text-foreground py-2 px-4 rounded-lg hover:bg-muted transition-colors font-medium">
            Send Message
          </button>
        </div>
      </div>
    </Card>
  )
}

export default ProfileCard
