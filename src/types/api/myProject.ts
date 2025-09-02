export namespace myProject {
    export type MyProject = {
        group: group;
        projectname: string;
        productname: string | null;
        company: string | null;
    }
}

type group = {
    id: number;
    codeNumber: string;
    projectName: string;
    productName: string | null;
    company: string | null;
}