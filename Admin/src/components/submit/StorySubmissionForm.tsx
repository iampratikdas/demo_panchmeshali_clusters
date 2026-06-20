import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {submitContents, fetchProfile} from "@/auth/api";
import React , {useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Hourglass } from 'react-loader-spinner';


function countWords(str: string) {
  return str
    // normalise Unicode
    .normalize('NFC')
    // split on any whitespace
    .split(/\s+/u)
    // remove punctuation at edges
    .map(t => t.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, ''))
    // filter non-empty tokens
    .filter(t => t.length > 0)
    .length;
}


const formSchema = z.object({
  eid: z.string().min(1, {
    message: "Please Select Atleast one event",
  }).default("12345"),
  type: z.string().min(1, {
    message: "Please Select Atleast one event",
  }).default("890"),
  storyName: z.string().min(2, {
    message: "Story name must be at least 2 words.",
  }),
  parent_id: z.string().optional(),
  event_content: z.boolean(),
  storyContent: z.string().refine((value) => {
    const words = countWords(value);
    return words >= 50 && words <= 200
  },
    { message: "The sentence must not less than 50 words and not contain more than 200 words" }),
  isOriginalWork: z.boolean({
    required_error: "isActive is required"
  }).default(false).refine((value) => value === true, {
    message: "This must be your original work",
  }),
})

export function StorySubmissionForm() {
  const nav = useNavigate();
  const [eventlists , setEventLists] = useState([]);
  const [loading , setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storyName: "",
      // author_name: "",
      storyContent: "",
      isOriginalWork: false,
      eid: "",
      type:"",
      parent_id:"",
      event_content: true
    },
  })
 const { reset } = form; 

useEffect(()=>{
  // fetch the event lists
  async function fetchEvents(){

    const res = await fetchProfile("/event_lists_users");
    setEventLists(res.data)
    // console.log("chchchc")
  }
  fetchEvents()
    

},[])
 
 async function onSubmit(values: z.infer<typeof formSchema>) {
 
  let checkevent = eventlists.find(item => values.eid === item.eid)
   console.log("values===================>", values);
  if(!checkevent.active){
     await Swal.fire({
      icon: "error",
      title: "Sorry!!",
      text: checkevent.description
    });
    return
  }
 
  const result = await Swal.fire({
    title: "Submit Content?",
    text: "Do you want to submit your content?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, submit",
    cancelButtonText: "No, cancel",
  });
 // return 
  // If user clicks "Cancel", just return
  if (!result.isConfirmed) {
    return;
  }
  setLoading(false)
  // If confirmed, call API
  // const res =0 
  const res = await submitContents(values, "/submit_contents");

  if (res === 0) {
    toast.error("Unauthorized User");
    setTimeout(() => {
      // nav("/signin");
    }, 5000);
    return;
  }
  setLoading(true)
  await Swal.fire({
    icon: "success",
    // title: "Successfully submitted!",
    text: res.message,
  });
   nav("/status/event_story");

  reset();
}

  console.log("eventlists===============>", eventlists)
  return (
    <React.Fragment>
      <ToastContainer position="bottom-center" />
      {!loading && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Hourglass size={100} color="#fff" />
      </div>
    )}
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="eid"
          render={({ field}) => (
            <FormItem>
              <FormLabel className="text-[0.8rem]">Events List</FormLabel>
              <FormControl>
                <Select onValueChange={(val) => {
                    // set selected eid in the field
                    field.onChange(val);
                    // find the selected item from your list

                    const selectedItem = eventlists.find(item => item.eid === val );
                    // if it has parent_id, set it in the form
                    form.setValue("parent_id", selectedItem?.parent || "");
                  }} value={field.value}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Event" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventlists.map(item => 
                    {
                      return item.active && (
                        <SelectItem key={item.eid} value={item.eid}>
                        {item?.name}
                      </SelectItem>
                        )
                    }
                      
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="storyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[0.8rem]">Story / Poem Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your story name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="author_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter author name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
 <FormField
          control={form.control}
          name="type"
          render={({ field}) => (
            <FormItem>
              <FormLabel className="text-[0.8rem]">Type of writings</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select type of your writing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="890">অণুগল্প</SelectItem>
                    <SelectItem value="891">কবিতা</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="storyContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Story / Poem Content (Total words : <span>{countWords(form.watch().storyContent)}</span>)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your story here..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isOriginalWork"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <AnimatedCheckbox
                  className="cursor-pointer"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Original Work
                </FormLabel>
                <FormDescription>
                  I confirm this is my original work
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <div className="w-[20%] flex justify-between gap-2">

          <Button disabled={!form.getValues().isOriginalWork} type="submit">Submit Story</Button>
          {/* <Button onClick={handleDarft}>Save as draft</Button> */}
        </div>
      </form>

    </Form>
    </React.Fragment>
  )
}
