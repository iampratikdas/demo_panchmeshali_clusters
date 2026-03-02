import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox"
import { motion } from "framer-motion"

const formSchema = z.object({
  submissionType: z.enum(["image", "link"]),
  content: z.string().min(1, {
    message: "This field cannot be empty.",
  }).url({
    message: "Invalid URL format",
  }),
  isOriginalWork: z.boolean().default(false).refine((value) => value === true, {
    message: "This must be your original work",
  }),
})

export function MediaSubmissionForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submissionType: "image",
      content: "",
      isOriginalWork: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // Handle form submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="submissionType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Submission Type</FormLabel>
              <FormControl>
                <div className="flex flex-col space-y-2">
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <AnimatedCheckbox
                        className="cursor-pointer"
                        checked={field.value === "image"}
                        onCheckedChange={() => {
                          field.onChange("image")
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Image URL
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <AnimatedCheckbox
                        className="cursor-pointer"
                        checked={field.value === "link"}
                        onCheckedChange={() => {
                          field.onChange("link")
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      External Link
                    </FormLabel>
                  </FormItem>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {form.watch("submissionType") === "image" ? "Image URL" : "Link"}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={form.watch("submissionType") === "image" 
                    ? "Enter image URL" 
                    : "Enter external link"
                  } 
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
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <AnimatedCheckbox
                    className="cursor-pointer"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </motion.div>
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Original Content
                </FormLabel>
                <FormDescription>
                  I confirm I have the rights to share this content
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit">Submit Media</Button>
      </form>
    </Form>
  )
}
