declare module '*.less' {
    const content: { [className: string]: string };
    export default content;
}

declare module 'react-beautiful-dnd';