import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { MediaSubmissionForm } from "../components/submit/MediaSubmissionForm"
import { ProfileSubmit } from "../components/submit/ProfileSubmit"
import { useDispatch } from "react-redux";
import {pageName} from "@/store/pageSlicer"
export function Profile() {
  const dispatch = useDispatch()
  dispatch(pageName("submit-content"))
  return (
    <Card className="w-full max-w-7xl mx-auto max-sm:mb-20">
      <CardHeader className="text-2xl">
        <CardTitle>My Profile</CardTitle>
        {/* <CardDescription>
          Share your story or media content with the community
        </CardDescription> */}
      </CardHeader>
      <CardContent>
          <ProfileSubmit />
      </CardContent>
    </Card>
  )
}
