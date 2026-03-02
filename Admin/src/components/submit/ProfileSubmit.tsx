import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button";
import { fetchProfile, submitContents } from "@/auth/api";
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";


import {
  Form,
  FormControl,
  
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  full_name: z.string().min(2, {
    message: "Story name must be at least 2 words.",
  }),
  isfirstTimeLogin: z.boolean(),
  phone_number: z.string().min(2, {
    message: "Author name must be at least 2 words.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  skills: z.string()
})

export function ProfileSubmit() {
  const nav = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      skills: "",
      email: "",
      isfirstTimeLogin: true
      // isOriginalWork: false,

    },
  })
  const { reset } = form;
  useEffect(() => {
    async function fetchProfileData() {
      const res = await fetchProfile("/getuserprofile");
      if (res === 0) {
        // console
        toast.error("UnAuthorized User");
        setTimeout(() => {
          nav("/signin")
        }, 5000)
      }
      if (res && res.data) {
         
        reset({
          full_name: res.data.full_name || "",
          phone_number: res.data.phone_number || "",
          skills: res.data.skills || "",
          email: res.data.email || "",
          isfirstTimeLogin: res.data.isfirstTimeLogin 
        });
      }
      toast(res.message);
    }
    fetchProfileData()
  }, [])
  function onSubmit(values: z.infer<typeof formSchema>) {
    // function onSubmit(values: z.infer<typeof formSchema>) {
    async function submitprofile() {
      const res = await submitContents(values, "/updateprofile", "POST");
      if (res === 0) {
        // console
        toast.error("UnAuthorized User");
        setTimeout(() => {
          nav("/signin")
        }, 5000)
      }
      //  console.log("isfirstTimeLogin==========> 123", res)
      localStorage.setItem("full_name", res.data.user.full_name);
      localStorage.setItem("phone_number", res.data.user.phone_number);
      toast(res.message);
    }
    submitprofile()
  }
  
  console.log("isfirstTimeLogin==========>", form.watch().isfirstTimeLogin)

  return (
    <Form {...form}>
      <ToastContainer />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[0.8rem]"> Name</FormLabel>
              <FormControl>
                <Input disabled={!form.watch().isfirstTimeLogin} placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter Phone Number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled={true}{...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills (Total words : <span>{form.watch().skills.split(/\s+/).filter(itme => itme != '').length}</span>)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your skills like (writing stories , painting etc) "
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <div className="w-[20%] flex justify-between gap-2">

          <Button type="submit">Update Your Profile</Button>
          {/* <Button onClick={handleDarft}>Save as draft</Button> */}
        </div>
      </form>

    </Form>
  )
}
