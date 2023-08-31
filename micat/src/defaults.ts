import type { ModalInjectInterface, StageInjectInterface } from "@/types";

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
