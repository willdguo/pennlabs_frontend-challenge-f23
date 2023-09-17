import axios from "axios";

interface Course {
    dept: string,
    number: number,
    title: string,
    description: string,
    prereqs?: string[] | string,
    "cross-listed"?: string[],
    "course_quality"?: number,
    "difficulty"?: number,
    "work_required"?: number,
}

// Change in future should semester/course reporting change
const baseUrl = '/api/base/2022A/courses'

// Conditionally returns iff course still exists
const getCourseData = async (id: string) => {
    const response = await axios.get(`${baseUrl}/${id}/`)
        .catch(error => {
            console.log(`${id} not found`)
            return
        })
    
    if (response) {
        return response.data
    }
}

// Retrieves the course quality, work, & difficulty of all courses
// Returns Course[]
const getAll = async (courses: Course[]) => {
    // Awaits all promises to complete before continuing 
    // --> ensures return is not array of promises :(
    const allData = await Promise.all(courses.map(async (course) => {
        const id = `${course.dept}-${course.number}`
        const courseData = await getCourseData(id)

        // // Rejects promises after 5 seconds - timeout
        // const timeoutPromise = Promise.race([
        //     courseData, 
        //     new Promise((_, reject) => {
        //         setTimeout(() => reject(new Error('Timeout')), 5000) 
        //     })
        // ])
        
        // console.log(courseData)
        if(courseData) {
            return {...course, 
                "course_quality": courseData["course_quality"].toFixed(2),
                "work_required": courseData["work_required"].toFixed(2),
                "difficulty": courseData["difficulty"].toFixed(2)
            }
        } else {
            return {...course}
        }
    }))
    
    return allData
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getCourseData,
    getAll
}