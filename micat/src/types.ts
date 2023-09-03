export interface HelpTextInterface {
    [key: string]: {
        title: string;
        text: string;
        type: string;
    }
}
export interface ModalInjectInterface {
    showModal: boolean;
    modalTitle: string;
    modalText: string;
    modalType: string;
    openModal(key: string): any;
    closeModal(): any;
}
export interface StageInjectInterface {
    stage: number;
    stages: { [key: string]: number }
}

export interface ImprovementValueInterface {
    [key: string]: number;
}

export interface ImprovementInterface {
    id: number;
    name?: string;
    values: ImprovementValueInterface;
}

export interface ProgramInterface {
    name: string;
    subsector: number;
    improvements: Array<ImprovementInterface>;
}

export interface SubsectorInterface {
    name: number | string;
    id: number | string;
    improvements: Array<ImprovementInterface>;
}
