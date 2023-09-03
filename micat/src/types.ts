export interface RegionsInterface {
    rows: Array<Array<number | string>>;
}
export interface SubsectorsInterface {
    rows: Array<Array<number | string>>;
}
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

export interface ProgramInterface {
    name: string;
    subsector: string;
}
