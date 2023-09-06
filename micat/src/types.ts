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

export interface PayloadParameterInterface {
    [key: string]: number;
}
export interface PayloadSavingDetailsInterface {
    [key: string]: Array<PayloadParameterInterface>;
}
export interface PayloadSavingsInterface {
    [key: string]: number | PayloadSavingDetailsInterface;
}
export interface PayloadMeasureInterface {
    id: number;
    savings: PayloadSavingsInterface;
    parameters: PayloadParameterInterface;
}
export interface PayloadInterface {
    measures: Array<PayloadMeasureInterface>;
    parameters: PayloadParameterInterface;
}
export interface ResultInterface {
    [key: string]: {
        title?: string;
        subtitle?: string;
        idColumnNames: Array<string>;
        rows: Array<Array<string | number>>;
        yearColumnNames: Array<string>;
    }
}
export interface MeasurementInterface {
    [key: string]: string
}
export interface CategoryInterface {
    [key: string]: string | Array<MeasurementInterface>
}
