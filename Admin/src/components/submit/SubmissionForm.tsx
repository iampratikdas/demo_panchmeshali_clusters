import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { MediaSubmissionForm } from "./MediaSubmissionForm"
import { StorySubmissionForm } from "./StorySubmissionForm";
import  PageStorySubmissionForm  from "./PageStorySubmissionForm";
import { useDispatch } from "react-redux";
import {pageName} from "@/store/pageSlicer";
import { useParams } from "react-router-dom";
interface Id {
  id?: string | undefined;
}

export function SubmissionForm() {
  const params = useParams();
  const id: Id = { id: params.id! };
  const dispatch = useDispatch()
  dispatch(pageName("submit-content"));

  id.id =!["event_story", "page_story"].includes(id.id!) ?  "event_story" : id.id

    return (
      <Card className="w-full max-w-7xl mx-auto max-sm:mb-20">
        <CardHeader className="text-2xl">
          <CardTitle>Submit Content</CardTitle>
          <CardDescription>
            Share your story or media content with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={id.id} className="w-full">
            <TabsList className="w-full flex flex-col md:flex-row gap-2" >
              <TabsTrigger value="event_story" className="text-[1rem] w-full">Event Content Submission</TabsTrigger>
              <TabsTrigger value="page_story" className="text-[1rem] w-full">Page Content Submission</TabsTrigger>
              {/* <TabsTrigger value="media" className="text-[1rem]">Media Submission</TabsTrigger> */}
            </TabsList>
            <TabsContent value="event_story">
              <StorySubmissionForm />
            </TabsContent>
            <TabsContent value="page_story">
              <PageStorySubmissionForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    )
 
}
