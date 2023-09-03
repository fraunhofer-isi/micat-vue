import type {ImprovementInterface, ModalInjectInterface, ProgramInterface, StageInjectInterface} from "@/types";

export const defaultModalInject: ModalInjectInterface = {
    showModal: false,
    modalTitle: '',
    modalText: '',
    modalType: '',
    openModal: () => null,
    closeModal: () => null
}
export const defaultStageInject: StageInjectInterface = {
    stage: 1,
    stages: {}
}
export const defaultImprovement: ImprovementInterface = {
    id: 0,
    values: {},
}
export const defaultProgram: ProgramInterface = {
    name: 'Program 1',
    subsector: 0,
    improvements: [{ ...defaultImprovement }]
}
