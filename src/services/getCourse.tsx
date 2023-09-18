import axios from "axios";

interface Course {
    id: string,
    title: string,
    description: string,
    prereqs?: string[] | string,
    "cross-listed"?: string[],
    "course_quality"?: number,
    "difficulty"?: number,
    "work_required"?: number,
}

// Currently accessing the Spring 2022 course list
// Change in future should semester/course reporting change
const baseUrl = '/api/base/2022A'

// Conditionally returns iff course still exists
const getCourseData = async (id: string) => {
    const response = await axios.get(`${baseUrl}/courses/${id}/`)
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
const getListData = async (courses: Course[]) => {
    // Awaits all promises to complete before continuing 
    // --> ensures return is not array of promises :(
    const allData = await Promise.all(courses.map(async (course) => {
        const id = course.id
        const courseData = await getCourseData(id)

        // // Rejects promises after 5 seconds - timeout (not needed - just that penn wifi is slow)
        // const timeoutPromise = Promise.race([
        //     courseData, 
        //     new Promise((_, reject) => {
        //         setTimeout(() => reject(new Error('Timeout')), 5000) 
        //     })
        // ])
        
        // console.log(courseData)
        if(courseData) {
            return {...course, 
                "course_quality": courseData["course_quality"],
                "work_required": courseData["work_required"],
                "difficulty": courseData["difficulty"]
            }
        } else {
            return {...course}
        }
    }))
    
    return allData
}

// Gets all CIS ourses for the semester
// Returns data from API w/ search query "CIS"
const getAll = async () => {
    const response = await axios.get(`${baseUrl}/search/courses/?search=cis`)
    return response.data
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getCourseData,
    getListData,
    getAll
}