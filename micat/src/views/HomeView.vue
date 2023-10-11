<script setup async lang="ts">
import {inject, onMounted, reactive, ref, watch} from 'vue';
import type {Ref} from 'vue';
import {
  InformationCircleIcon,
  TrashIcon,
  PlusCircleIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline';
import type {
  ModalInjectInterface,
  ProgramInterface,
  SubsectorInterface,
  ImprovementValueInterface,
  PayloadInterface,
  PayloadMeasureInterface,
  ResultsInterface,
  UnitInterface,
} from "@/types";
import { defaultImprovement, defaultModalInject, defaultProgram, stages } from "@/defaults";
import { useSessionStore } from "@/stores/session";
import ResultsOverlay from "@/components/ResultsOverlay.vue";

const session = useSessionStore();

// Injections
const {openModal} = inject<ModalInjectInterface>('modal') || defaultModalInject

// Variables
let regions: Ref<Array<Array<number | string>>> = ref([]);
let subsectors: Ref<Array<SubsectorInterface>> = ref([]);
const units: UnitInterface = {
  1: {
    name: "ktoe (tonne of oil equivalent)",
    factor: 1
  },
  2: {
    name: "MJ (Megajoule)",
    factor: 41868000

  },
  3: {
    name: "GJ (Gigajoule)",
    factor: 41868
  },
  4: {
    name: "MWh (Energy quantity per hour)",
    factor: 11630
  },
}

// Session
const future = ref<boolean>(session.future);
const stage = ref<number>(session.stage);
const region = ref<number>(session.region);
const municipality = ref<boolean>(session.municipality);
const unit = ref<number>(session.unit);
const inhabitants = ref<number>(session.inhabitants);
const years = ref<Array<number>>(session.years);
const programs = reactive<Array<ProgramInterface>>(session.programs);

// Refs
const newYears = ref<Array<number>>([...Array(30).keys()].map(delta => session.currentYear - delta).filter(newYear => years.value.indexOf(newYear) == -1));
const newYearSelected = ref<number>(newYears.value[0]);
const results = ref<ResultsInterface>({
    "addedAssetValueOfBuildings": {
        "idColumnNames": [
            "id_measure",
            "sector"
        ],
        "rows": [
            [
                2,
                "Tertiary",
                0.0,
                0.0,
                0.0
            ],
            [
                2,
                "Residential",
                7054705617.977529,
                9114606741.573034,
                12152808988.764046
            ],
            [
                3,
                "Tertiary",
                0.0,
                0.0,
                0.0
            ],
            [
                3,
                "Residential",
                16758288561.076872,
                19926331544.450752,
                21647757301.812695
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "additionalEmployment": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                -535086.9464765731,
                -691326.8042332986,
                -921769.0723110648
            ],
            [
                2.0,
                -535086.9464765731,
                -691326.8042332986,
                -921769.0723110648
            ],
            [
                3.0,
                -2774524.907656309,
                -3456634.0211664983,
                -3917518.5573220314
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "changeInSupplierDiversityByEnergyEfficiencyImpact": {
        "idColumnNames": [
            "id_measure",
            "final_energy_carrier"
        ],
        "rows": [
            [
                1,
                "Oil",
                0.0,
                0.0,
                0.0
            ],
            [
                1,
                "Coal",
                -2.7755575615628914e-17,
                0.0,
                0.0
            ],
            [
                1,
                "Gas",
                6.938893903907228e-18,
                0.0,
                0.0
            ],
            [
                2,
                "Oil",
                0.0,
                0.0,
                0.0
            ],
            [
                2,
                "Coal",
                -2.7755575615628914e-17,
                0.0,
                0.0
            ],
            [
                2,
                "Gas",
                6.938893903907228e-18,
                0.0,
                0.0
            ],
            [
                3,
                "Oil",
                0.0009706068817075253,
                -1.0,
                -1.0
            ],
            [
                3,
                "Coal",
                0.0002151280786211185,
                -1.0,
                -1.0
            ],
            [
                3,
                "Gas",
                0.000392918010348714,
                -1.0,
                -1.0
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "changeInUnitCostsOfProduction": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                -0.0010980162137508443,
                -0.0012419443895419296,
                -0.0015669628767255982
            ],
            [
                2.0,
                -4.1465651584139424e-05,
                -4.690097714286397e-05,
                -5.9175024810998174e-05
            ],
            [
                3.0,
                -9.850068766147859e-05,
                -0.00010253480449625228,
                -0.00010540827035310072
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "energyIntensity": {
        "idColumnNames": [
            "label"
        ],
        "rows": [
            [
                "Baseline",
                9.891693086815532e-05,
                8.972253363934718e-05,
                8.066959358195285e-05
            ],
            [
                "Including saving",
                -3.164801915821927e-07,
                -2.6039016700654067e-07,
                -2.0771555540775812e-07
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "energySaving": {
        "idColumnNames": [
            "id_measure",
            "primary_energy_carrier"
        ],
        "rows": [
            [
                1,
                "Oil",
                2.104627818693828,
                2.63246344254502,
                3.5099512567266933
            ],
            [
                1,
                "Coal",
                8.704552174490365,
                12.09221822485486,
                16.122957633139816
            ],
            [
                1,
                "Gas",
                7.1462731094223875,
                9.329421024155943,
                12.439228032207923
            ],
            [
                1,
                "Biomass and renewable waste",
                5.109287045061942,
                6.706111187845116,
                8.941481583793488
            ],
            [
                1,
                "Renewables",
                7.6289898341703575,
                9.51988406659003,
                12.693178755453374
            ],
            [
                1,
                "Other",
                178.07385607701184,
                234.13556346812805,
                312.1807512908374
            ],
            [
                2,
                "Oil",
                2.104627818693828,
                2.63246344254502,
                3.5099512567266933
            ],
            [
                2,
                "Coal",
                8.704552174490365,
                12.09221822485486,
                16.122957633139816
            ],
            [
                2,
                "Gas",
                7.1462731094223875,
                9.329421024155943,
                12.439228032207923
            ],
            [
                2,
                "Biomass and renewable waste",
                5.109287045061942,
                6.706111187845116,
                8.941481583793488
            ],
            [
                2,
                "Renewables",
                7.6289898341703575,
                9.51988406659003,
                12.693178755453374
            ],
            [
                2,
                "Other",
                178.07385607701184,
                234.13556346812805,
                312.1807512908374
            ],
            [
                3,
                "Oil",
                189.41509312997047,
                184.17333242201502,
                208.72977674495039
            ],
            [
                3,
                "Coal",
                52.55666923718621,
                60.14876779748539,
                68.16860350381677
            ],
            [
                3,
                "Gas",
                471.4305363964678,
                622.82391513459,
                705.8671038192022
            ],
            [
                3,
                "Biomass and renewable waste",
                307.5691597344232,
                397.02235094126024,
                449.95866440009496
            ],
            [
                3,
                "Renewables",
                2.179166067042744,
                2.6143736144960767,
                2.962956763095553
            ],
            [
                3,
                "Other",
                50.865516015290076,
                64.29887539224022,
                72.87205877787224
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "impactOnGrossDomesticProduct": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                -535086946476.5731,
                -691326804233.2986,
                -921769072311.0647
            ],
            [
                2.0,
                -535086946476.5731,
                -691326804233.2986,
                -921769072311.0647
            ],
            [
                3.0,
                -2774524907656.309,
                -3456634021166.498,
                -3917518557322.031
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "impactOnResTargetsMonetization": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                4891481.816826688,
                6360370.36265553,
                8480493.816877937
            ],
            [
                2.0,
                4891481.816826688,
                6360370.36265553,
                8480493.816877937
            ],
            [
                3.0,
                25164492.8305213,
                30851635.845486417,
                34965187.291554786
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "lifetime": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                8.0
            ],
            [
                2.0,
                8.0
            ],
            [
                3.0,
                17.0
            ]
        ],
        "yearColumnNames": [
            "value"
        ]
    },
    "reductionInDisabilityAdjustedLifeYears": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                0.0,
                0.0,
                0.0
            ],
            [
                2.0,
                0.0,
                0.0,
                0.0
            ],
            [
                3.0,
                0.0,
                0.0,
                0.0
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfAdditionalCapacitiesInGrid": {
        "idColumnNames": [
            "id_measure",
            "technology"
        ],
        "rows": [
            [
                1,
                "Onshore wind",
                0.004996696109526411,
                0.00578244304148877,
                0.007139057365231737
            ],
            [
                1,
                "Offshore wind",
                0.00041076261325764216,
                0.0007863095673232724,
                0.0013152442170636255
            ],
            [
                1,
                "Solar",
                0.003822803917819338,
                0.00535665131961611,
                0.007446236988942175
            ],
            [
                2,
                "Onshore wind",
                0.004996696109526411,
                0.00578244304148877,
                0.007139057365231737
            ],
            [
                2,
                "Offshore wind",
                0.00041076261325764216,
                0.0007863095673232724,
                0.0013152442170636255
            ],
            [
                2,
                "Solar",
                0.003822803917819338,
                0.00535665131961611,
                0.007446236988942175
            ],
            [
                3,
                "Onshore wind",
                0.0014272702999857348,
                0.0015879885100753832,
                0.0016664634375650504
            ],
            [
                3,
                "Offshore wind",
                0.00011733138565889817,
                0.0002159382374046213,
                0.0003070162189590776
            ],
            [
                3,
                "Solar",
                0.0010919564398103427,
                0.0014710565563721414,
                0.0017381680878416374
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfAdditionalCapacitiesInGridMonetization": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                11101.865956075366,
                14661.95505154016,
                19952.297250836746
            ],
            [
                2.0,
                11101.865956075366,
                14661.95505154016,
                19952.297250836746
            ],
            [
                3.0,
                3171.168149153448,
                4026.5015997620553,
                4657.445957204436
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfAirPollution": {
        "idColumnNames": [
            "id_measure",
            "parameter"
        ],
        "rows": [
            [
                1,
                "SO2",
                0.0,
                0.0,
                0.0
            ],
            [
                1,
                "NOX",
                0.0,
                0.0,
                0.0
            ],
            [
                1,
                "PM_2_5",
                0.0,
                0.0,
                0.0
            ],
            [
                2,
                "SO2",
                0.0,
                0.0,
                0.0
            ],
            [
                2,
                "NOX",
                0.0,
                0.0,
                0.0
            ],
            [
                2,
                "PM_2_5",
                0.0,
                0.0,
                0.0
            ],
            [
                3,
                "SO2",
                1.791365533896851,
                2.074834920241621,
                2.5044483460877704
            ],
            [
                3,
                "NOX",
                2.5418837514557175,
                3.135534765745144,
                3.5630803688496027
            ],
            [
                3,
                "PM_2_5",
                4.414103041093398,
                4.612493991330482,
                3.9261558861525443
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfEnergyCost": {
        "idColumnNames": [
            "id_measure",
            "final_energy_carrier"
        ],
        "rows": [
            [
                1,
                "Electricity",
                354801600.0,
                458400000.0,
                611200000.0
            ],
            [
                1,
                "Oil",
                0.0,
                0.0,
                0.0
            ],
            [
                1,
                "Coal",
                0.0,
                0.0,
                0.0
            ],
            [
                1,
                "Gas",
                0.0,
                0.0,
                0.0
            ],
            [
                1,
                "Biomass and Waste",
                0.0,
                0.0,
                0.0
            ],
            [
                1,
                "Heat",
                0.0,
                0.0,
                0.0
            ],
            [
                1,
                "H2 and e-fuels",
                0.0,
                0.0,
                0.0
            ],
            [
                2,
                "Electricity",
                313934400.0,
                405600000.0,
                540800000.0
            ],
            [
                2,
                "Oil",
                0.0,
                0.0,
                0.0
            ],
            [
                2,
                "Coal",
                0.0,
                0.0,
                0.0
            ],
            [
                2,
                "Gas",
                0.0,
                0.0,
                0.0
            ],
            [
                2,
                "Biomass and Waste",
                0.0,
                0.0,
                0.0
            ],
            [
                2,
                "Heat",
                0.0,
                0.0,
                0.0
            ],
            [
                2,
                "H2 and e-fuels",
                0.0,
                0.0,
                0.0
            ],
            [
                3,
                "Electricity",
                89673103.07496566,
                111386854.14889033,
                126238434.70207569
            ],
            [
                3,
                "Oil",
                124428374.15857017,
                100946333.77106158,
                91798701.92833465
            ],
            [
                3,
                "Coal",
                12667779.960744457,
                11142544.913348112,
                8961960.855036976
            ],
            [
                3,
                "Gas",
                170857688.77975243,
                212228793.5496775,
                225173244.78745925
            ],
            [
                3,
                "Biomass and Waste",
                275498755.7792615,
                355662632.20337665,
                403084316.4971602
            ],
            [
                3,
                "Heat",
                72618139.21462654,
                95354595.14170428,
                108068541.16059819
            ],
            [
                3,
                "H2 and e-fuels",
                0.0,
                0.0,
                0.0
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfEnergyPoverty": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                0.0,
                0.0,
                0.0
            ],
            [
                2.0,
                305973.2254637775,
                395216.47378501773,
                490357.7205392729
            ],
            [
                3.0,
                753449.4171681114,
                860246.4467608522,
                930607.0666678466
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfGreenHouseGasEmission": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                0.0,
                0.0,
                0.0
            ],
            [
                2.0,
                0.0,
                0.0,
                0.0
            ],
            [
                3.0,
                1752.0655410481504,
                2088.8380110652706,
                2366.755652435048
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfGreenHouseGasEmissionMonetization": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                0.0,
                0.0,
                0.0
            ],
            [
                2.0,
                0.0,
                0.0,
                0.0
            ],
            [
                3.0,
                348661042.6685819,
                436567144.31264156,
                518319487.8832755
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfImportDependency": {
        "idColumnNames": [
            "id_measure",
            "primary_energy_carrier"
        ],
        "rows": [
            [
                1,
                "Oil",
                3.8780857536391267e-07,
                4.057768752119273e-07,
                5.974570859157424e-07
            ],
            [
                1,
                "Coal",
                3.5309378981662753e-05,
                5.2686942384361224e-05,
                8.960059011009491e-05
            ],
            [
                1,
                "Gas",
                4.8041804360243745e-06,
                5.013287020294577e-06,
                7.891460313880216e-06
            ],
            [
                2,
                "Oil",
                3.8780857536391267e-07,
                4.057768752119273e-07,
                5.974570859157424e-07
            ],
            [
                2,
                "Coal",
                3.5309378981662753e-05,
                5.2686942384361224e-05,
                8.960059011009491e-05
            ],
            [
                2,
                "Gas",
                4.8041804360243745e-06,
                5.013287020294577e-06,
                7.891460313880216e-06
            ],
            [
                3,
                "Oil",
                3.49206618311948e-05,
                2.8402041168940073e-05,
                3.555006814159878e-05
            ],
            [
                3,
                "Coal",
                0.00021325374821723475,
                0.00026216683928848017,
                0.0003790119369762035
            ],
            [
                3,
                "Gas",
                0.0003174489321490226,
                0.0003353971751636209,
                0.000449011369465957
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfLostWorkDays": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                1335.5461894463006,
                775.1320084682696,
                562.6097884052277
            ],
            [
                2.0,
                1335.5461894463006,
                775.1320084682696,
                562.6097884052277
            ],
            [
                3.0,
                64166.34490576967,
                41847.0996228669,
                33887.21338474517
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfLostWorkDaysMonetization": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                259580.6957872304,
                163433.9305927217,
                127898.19841509279
            ],
            [
                2.0,
                259580.6957872304,
                163433.9305927217,
                127898.19841509279
            ],
            [
                3.0,
                12471560.016706418,
                8823317.706599787,
                7703587.158520994
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfMortalityMorbidity": {
        "idColumnNames": [
            "id_measure",
            "parameter"
        ],
        "rows": [
            [
                1,
                "Mortality_AP",
                4.610904874687529,
                2.77538624099072,
                2.18239556352558
            ],
            [
                2,
                "Mortality_AP",
                4.610904874687529,
                2.77538624099072,
                2.18239556352558
            ],
            [
                3,
                "Mortality_AP",
                183.35329666804378,
                166.10540895731296,
                142.2683362738052
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "reductionOfMortalityMorbidityMonetization": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                15480270.648518933,
                10108085.556136882,
                8569777.595855044
            ],
            [
                2.0,
                15480270.648518933,
                10108085.556136882,
                8569777.595855044
            ],
            [
                3.0,
                615575192.6918361,
                604963612.0118097,
                558655828.1071839
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "renewableEnergyDirectiveTargets": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                2.2031411441802984e-05,
                2.709133495265581e-05,
                3.6124087913258496e-05
            ],
            [
                2.0,
                2.2031411441802984e-05,
                2.709133495265581e-05,
                3.6124087913258496e-05
            ],
            [
                3.0,
                0.00011341426655103737,
                0.0001315063868507771,
                0.0001490590631426092
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "subsidyRate": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                31.0,
                31.0,
                31.0
            ],
            [
                2.0,
                30.0,
                30.0,
                30.0
            ],
            [
                3.0,
                30.0,
                30.0,
                30.000000000000004
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    },
    "turnoverOfEnergyEfficiencyGoods": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                0.0,
                0.0,
                0.0
            ],
            [
                2.0,
                3552979181.622398,
                4590412379.357103,
                6120549839.142804
            ],
            [
                3.0,
                36385538805.136795,
                45330820770.519264,
                51374930206.5885
            ]
        ],
        "yearColumnNames": [
            "2020",
            "2025",
            "2030"
        ]
    }
});
const showResults = ref<boolean>(true);
const error = ref<string>("");

// Watchers
watch(programs, (programs) => {
  session.updatePrograms(programs);
});
watch(() => session.future, (future) => {
  // Check if there are valid years defined. If not add default ones.
  const currentYear = new Date().getFullYear();
  if (future) {
    // Filter out years from the past
    years.value = years.value.filter(year => year >= currentYear);
    if (years.value.length == 0) {
      // Round up to nearest 5
      const nextValidYear = Math.ceil(currentYear / 5) * 5;
      years.value = [nextValidYear, nextValidYear + 5, nextValidYear + 10];
      newYears.value = [...Array(30).keys()].map(delta => currentYear + delta).filter(newYear => years.value.indexOf(newYear) == -1);
    }
  } else {
    // Filter out years from the past
    years.value = years.value.filter(year => year <= currentYear);
    if (years.value.length == 0) {
      // Round down to nearest 5
      const nextValidYear = Math.floor(currentYear / 5) * 5;
      years.value = [nextValidYear - 10, nextValidYear - 5, nextValidYear];
      newYears.value = [...Array(30).keys()].map(delta => currentYear - delta).filter(newYear => years.value.indexOf(newYear) == -1);
    }
  }
  session.updateFuture(future);
  session.updateYears(years.value);
});
watch(() => session.region, (region) => {
  session.updateRegion(region);
});
watch(() => session.municipality, (municipality) => {
  session.updateMunicipality(municipality);
});
watch(() => session.inhabitants, (inhabitants) => {
  session.updateInhabitants(inhabitants);
});
watch(() => session.unit, (unit) => {
 session.updateUnit(unit);
});
watch(() => session.inhabitants, (inhabitants) => {
  session.updateInhabitants(inhabitants);
});

// Lifecycle
onMounted(async () => {
  // id_region
  const responseRegion: Response = await fetch(`${import.meta.env.VITE_API_URL}id_region`);
  const dataRegion: { rows: Array<[id: number, name: string]> } = await responseRegion.json();
  regions.value = dataRegion.rows;

  // id_subsector
  // Get all database tables related to subsectors and descendants
  const responseSubsector: Response = await fetch(`${import.meta.env.VITE_API_URL}id_subsector`);
  const dataSubsector: { rows: Array<[id: number, name: string]> } = await responseSubsector.json();
  const responseImprovements: Response = await fetch(`${import.meta.env.VITE_API_URL}id_action_type`);
  const dataImprovements: {
    rows: Array<[id: number, name: string, name2: string]>
  } = await responseImprovements.json();
  const responseMapping: Response = await fetch(`${import.meta.env.VITE_API_URL}mapping__subsector__action_type`);
  const dataMapping: {
    rows: Array<[id: number, idSubsector: number, idImprovement: number]>
  } = await responseMapping.json();

  const improvements: {
    [key: number]: { id: number, subsectors: Array<number>, name: string, values: ImprovementValueInterface }
  } = {};
  dataImprovements.rows.forEach(improvement => {
    improvements[improvement[0]] = {
      id: improvement[0],
      name: improvement[2],
      values: {},
      subsectors: []
    };
  });
  dataMapping.rows.forEach(mapping => {
    improvements[mapping[2]].subsectors.push(mapping[1]);
  });
  dataSubsector.rows.forEach(subsector => {
    subsectors.value.push({
      id: subsector[0],
      name: subsector[1],
      improvements: Object.values(improvements).filter(improvement => improvement.subsectors.indexOf(subsector[0]) > -1)
    });
  });
})

// Functions
const addYear = () => {
  years.value.push(newYearSelected.value);
  years.value.sort();
  session.updateYears(years.value);
  newYears.value = newYears.value.filter(newYear => newYear !== newYearSelected.value);
  newYearSelected.value = newYears.value[0];
};
const removeYear = (year: number) => {
  if (years.value.length > 2) {
    // Keep at least two years
    years.value = years.value.filter(x => x !== year);
    session.updateYears(years.value);
    newYears.value.push(year);
    newYears.value.sort();
  }
};
const addProgram = () => {
  const clone = JSON.parse(JSON.stringify(defaultProgram));
  clone.name = `Program ${programs.length + 1}`
  programs.push(clone);
  session.updatePrograms(programs);
}
const removeProgram = (i: number) => {
  if (programs.length >= 2) {
    programs.splice(i, 1);
    session.updatePrograms(programs);
  }
}
const copyImprovement = (program: ProgramInterface, i: number) => {
  program.improvements.push(JSON.parse(JSON.stringify(program.improvements[i])));
}
const addImprovement = (program: ProgramInterface) => {
  program.improvements.push(JSON.parse(JSON.stringify(defaultImprovement)));
}
const removeImprovement = (program: ProgramInterface, i: number) => {
  if (program.improvements.length >= 2) {
    program.improvements.splice(i, 1);
  }
}
const getSubsectorImprovements = (subsectorId: number) => {
  if (!subsectorId || subsectors.value.length === 0) return [];
  return subsectors.value.filter(subsector => subsector.id === subsectorId)[0].improvements;
}
const analyze = async () => {
  const url = `https://micatool-dev.eu/mica-tool-wGlobal/python/back_end/src/api/indicator_data?id_mode=${future.value ? 4 : 2}&id_region=${region.value}`
  const payload: PayloadInterface = {
    "measures": [],
    "parameters": {
      // "FuelSplitCoefficient": [
      //   {
      //     "2015": 0.179977880752083,
      //     "2016": 0.1766937246663977,
      //     "2017": 0.1778916566397054,
      //     "2018": 0.1641509666185604,
      //     "2019": 0.167171489435066,
      //     "2020": 0.1605908655931988,
      //     "2021": 0.1601777340493887,
      //     "id_subsector": 1,
      //     "id_final_energy_carrier": 1
      //   },
      // ],
      // "EnergyPrice": [],
      // "ElectricityGeneration": [],
      // "HeatGeneration": []
    }
  }
  if (municipality.value) payload["population"] = inhabitants.value;
  let i = 1;
  programs.forEach(program => {
    program.improvements.forEach(improvement => {
      const improvementData: PayloadMeasureInterface = {
        "id": i,
        "savings": {
          "details": {
            "parameters": [
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 535622569.0456187,
            //     "2025": 692018823.0563549,
            //     "2030": 922691764.0751399,
            //     "id_parameter": 40
            //   },
            //   {
            //     "2000": 31,
            //     "2010": 31,
            //     "2015": 31,
            //     "2020": 31,
            //     "2025": 31,
            //     "2030": 31,
            //     "id_parameter": 35
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 0,
            //     "2030": 0,
            //     "id_parameter": 45
            //   },
            //   {
            //     "2000": 20,
            //     "2010": 20,
            //     "2015": 20,
            //     "2020": 20,
            //     "2025": 20,
            //     "2030": 20,
            //     "id_parameter": 42
            //   },
            //   {
            //     "2000": 23754205.51982583,
            //     "2010": 23924812.46237311,
            //     "2015": 23968007.16277976,
            //     "2020": 24011201.8631864,
            //     "2025": 24062569.76836053,
            //     "2030": 24113937.67353465,
            //     "id_parameter": 32
            //   },
            //   {
            //     "2000": 2.79101928590836,
            //     "2010": 2.795743031883219,
            //     "2015": 2.7937031776348,
            //     "2020": 2.79166332338638,
            //     "2025": 2.790559240638709,
            //     "2030": 2.789455157891037,
            //     "id_parameter": 31
            //   },
            //   {
            //     "2000": 3786.298909558472,
            //     "2010": 3835.057541165328,
            //     "2015": 3857.204751368041,
            //     "2020": 3879.351961570755,
            //     "2025": 3899.888507180995,
            //     "2030": 3920.425052791236,
            //     "id_parameter": 29
            //   },
            //   {
            //     "2000": 8,
            //     "2010": 8,
            //     "2015": 8,
            //     "2020": 8,
            //     "2025": 8,
            //     "2030": 8,
            //     "id_parameter": 34
            //   }
            // ],
            // "finalParameters": [
            //   {
            //     "2000": 1,
            //     "2010": 1,
            //     "2015": 1,
            //     "2020": 1,
            //     "2025": 1,
            //     "2030": 1,
            //     "id_parameter": 16,
            //     "id_final_energy_carrier": 1
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 0,
            //     "2030": 0,
            //     "id_parameter": 16,
            //     "id_final_energy_carrier": 2
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 0,
            //     "2030": 0,
            //     "id_parameter": 16,
            //     "id_final_energy_carrier": 3
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 0,
            //     "2030": 0,
            //     "id_parameter": 16,
            //     "id_final_energy_carrier": 4
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 0,
            //     "2030": 0,
            //     "id_parameter": 16,
            //     "id_final_energy_carrier": 5
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 0,
            //     "2030": 0,
            //     "id_parameter": 16,
            //     "id_final_energy_carrier": 6
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 0,
            //     "2030": 0,
            //     "id_parameter": 16,
            //     "id_final_energy_carrier": 7
            //   },
            //   {
            //     "2000": 10001,
            //     "2010": 10000,
            //     "2015": 10000,
            //     "2020": 10000,
            //     "2025": 10000,
            //     "2030": 10000,
            //     "id_parameter": 17,
            //     "id_final_energy_carrier": 1
            //   },
            //   {
            //     "2000": 30000,
            //     "2010": 30000,
            //     "2015": 30000,
            //     "2020": 30000,
            //     "2025": 30000,
            //     "2030": 30000,
            //     "id_parameter": 17,
            //     "id_final_energy_carrier": 2
            //   },
            //   {
            //     "2000": 7000,
            //     "2010": 7000,
            //     "2015": 7000,
            //     "2020": 7000,
            //     "2025": 7000,
            //     "2030": 7000,
            //     "id_parameter": 17,
            //     "id_final_energy_carrier": 3
            //   },
            //   {
            //     "2000": 50000,
            //     "2010": 50000,
            //     "2015": 50000,
            //     "2020": 50000,
            //     "2025": 50000,
            //     "2030": 50000,
            //     "id_parameter": 17,
            //     "id_final_energy_carrier": 4
            //   },
            //   {
            //     "2000": 30000,
            //     "2010": 30000,
            //     "2015": 30000,
            //     "2020": 30000,
            //     "2025": 30000,
            //     "2030": 30000,
            //     "id_parameter": 17,
            //     "id_final_energy_carrier": 5
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 0,
            //     "2030": 0,
            //     "id_parameter": 17,
            //     "id_final_energy_carrier": 6
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 0,
            //     "2030": 0,
            //     "id_parameter": 17,
            //     "id_final_energy_carrier": 7
            //   },
            //   {
            //     "2000": 60,
            //     "2010": 60,
            //     "2015": 60,
            //     "2020": 60,
            //     "2025": 60,
            //     "2030": 60,
            //     "id_parameter": 18,
            //     "id_final_energy_carrier": 1
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 0,
            //     "2030": 0,
            //     "id_parameter": 18,
            //     "id_final_energy_carrier": 2
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 0,
            //     "2030": 0,
            //     "id_parameter": 18,
            //     "id_final_energy_carrier": 3
            //   },
            //   {
            //     "2000": 10,
            //     "2010": 10,
            //     "2015": 10,
            //     "2020": 10,
            //     "2025": 5,
            //     "2030": 5,
            //     "id_parameter": 18,
            //     "id_final_energy_carrier": 4
            //   },
            //   {
            //     "2000": 10,
            //     "2010": 10,
            //     "2015": 10,
            //     "2020": 10,
            //     "2025": 10,
            //     "2030": 5,
            //     "id_parameter": 18,
            //     "id_final_energy_carrier": 5
            //   },
            //   {
            //     "2000": 20,
            //     "2010": 20,
            //     "2015": 20,
            //     "2020": 20,
            //     "2025": 20,
            //     "2030": 25,
            //     "id_parameter": 18,
            //     "id_final_energy_carrier": 6
            //   },
            //   {
            //     "2000": 0,
            //     "2010": 0,
            //     "2015": 0,
            //     "2020": 0,
            //     "2025": 5,
            //     "2030": 5,
            //     "id_parameter": 18,
            //     "id_final_energy_carrier": 7
            //   },
            //   {
            //     "2000": 1,
            //     "2010": 1,
            //     "2015": 1,
            //     "2020": 1,
            //     "2025": 1,
            //     "2030": 1,
            //     "id_parameter": 14,
            //     "id_final_energy_carrier": 1
            //   },
            //   {
            //     "2000": 0.7360000000000001,
            //     "2010": 0.7360000000000001,
            //     "2015": 0.7360000000000001,
            //     "2020": 0.7360000000000001,
            //     "2025": 0.7360000000000001,
            //     "2030": 0.7440000000000001,
            //     "id_parameter": 14,
            //     "id_final_energy_carrier": 2
            //   },
            //   {
            //     "2000": 0.4,
            //     "2010": 0.4,
            //     "2015": 0.4,
            //     "2020": 0.4,
            //     "2025": 0.48,
            //     "2030": 0.544,
            //     "id_parameter": 14,
            //     "id_final_energy_carrier": 3
            //   },
            //   {
            //     "2000": 0.792,
            //     "2010": 0.792,
            //     "2015": 0.792,
            //     "2020": 0.792,
            //     "2025": 0.792,
            //     "2030": 0.8,
            //     "id_parameter": 14,
            //     "id_final_energy_carrier": 4
            //   },
            //   {
            //     "2000": 0.668,
            //     "2010": 0.668,
            //     "2015": 0.668,
            //     "2020": 0.668,
            //     "2025": 0.684,
            //     "2030": 0.7040000000000001,
            //     "id_parameter": 14,
            //     "id_final_energy_carrier": 5
            //   },
            //   {
            //     "2000": 0.792,
            //     "2010": 0.792,
            //     "2015": 0.792,
            //     "2020": 0.792,
            //     "2025": 0.792,
            //     "2030": 0.794,
            //     "id_parameter": 14,
            //     "id_final_energy_carrier": 6
            //   },
            //   {
            //     "2000": 0.792,
            //     "2010": 0.792,
            //     "2015": 0.792,
            //     "2020": 0.792,
            //     "2025": 0.792,
            //     "2030": 0.8,
            //     "id_parameter": 14,
            //     "id_final_energy_carrier": 7
            //   },
            //   {
            //     "2000": 3.025,
            //     "2010": 3.025,
            //     "2015": 3.025,
            //     "2020": 3.025,
            //     "2025": 3.175,
            //     "2030": 3.325,
            //     "id_parameter": 15,
            //     "id_final_energy_carrier": 1
            //   },
            //   {
            //     "2000": 0.92,
            //     "2010": 0.92,
            //     "2015": 0.92,
            //     "2020": 0.92,
            //     "2025": 0.92,
            //     "2030": 0.93,
            //     "id_parameter": 15,
            //     "id_final_energy_carrier": 2
            //   },
            //   {
            //     "2000": 0.5,
            //     "2010": 0.5,
            //     "2015": 0.5,
            //     "2020": 0.5,
            //     "2025": 0.6,
            //     "2030": 0.68,
            //     "id_parameter": 15,
            //     "id_final_energy_carrier": 3
            //   },
            //   {
            //     "2000": 0.99,
            //     "2010": 0.99,
            //     "2015": 0.99,
            //     "2020": 0.99,
            //     "2025": 0.99,
            //     "2030": 1,
            //     "id_parameter": 15,
            //     "id_final_energy_carrier": 4
            //   },
            //   {
            //     "2000": 0.835,
            //     "2010": 0.835,
            //     "2015": 0.835,
            //     "2020": 0.835,
            //     "2025": 0.855,
            //     "2030": 0.88,
            //     "id_parameter": 15,
            //     "id_final_energy_carrier": 5
            //   },
            //   {
            //     "2000": 0.99,
            //     "2010": 0.99,
            //     "2015": 0.99,
            //     "2020": 0.99,
            //     "2025": 0.99,
            //     "2030": 0.9924999999999999,
            //     "id_parameter": 15,
            //     "id_final_energy_carrier": 6
            //   },
            //   {
            //     "2000": 0.99,
            //     "2010": 0.99,
            //     "2015": 0.99,
            //     "2020": 0.99,
            //     "2025": 0.99,
            //     "2030": 1,
            //     "id_parameter": 15,
            //     "id_final_energy_carrier": 7
            //   }
            // ],
            // "constants": [
            //   {
            //     "id_parameter": 36,
            //     "value": 8
            //   }
            ]
          },
          "id_measure": 1,
          "id_subsector": program.subsector,
          "id_action_type": improvement.id,
        },
        "parameters": {}
      };

      years.value.forEach(year => {
        const value = improvement.values[year.toString()];
        const factor = units[unit.value].factor
        improvementData.savings[year.toString()] = value ? value * 1 / factor : 0;
      });
      payload.measures.push(improvementData);
      i++;
    });
  });

  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(payload),
  });
  session.updatePayload(payload);
  const data = await response.json();
  if (Object.prototype.hasOwnProperty.call(data, 'error')) {
    error.value = data.error.arg0;
  } else {
    results.value = data;
    showResults.value = true;
  }
}
</script>

<template>
  <main>
    <ResultsOverlay v-if="showResults" :results="results" :years="years" :factor="units[unit].factor" @close="showResults = false;"></ResultsOverlay>
    <div v-else class="grid grid-cols-5 lg:grid-cols-10 gap-8 max-w-screen-xl mx-auto pt-[15vh] pb-[20vh]">
      <div class="col col-span-5 pr-[7rem]" v-if="stage === stages.home">
        <h1 class="text-4xl dark:text-white font-bold leading-normal">Assess the impacts of energy efficiency
          projects</h1>
        <p class="mt-6 text-lg font-light dark:text-white">Select a suitable scenario from the world of energy
          efficiency, optionally add your own values and receive a comprehensive analysis for your region.</p>
      </div>
      <div
        class="col"
        :class="{
            'col-span-4': stage === stages.full,
            'col-span-5': stage === stages.home,
          }"
      >
        <div class="rounded-3xl border border-gray-300 dark:border-gray-400 relative px-8 py-8 mb-5">
          <div class="absolute top-[-14px] left-0 w-full text-center">
            <span class="inline-block font-bold italic bg-white dark:bg-blue-950 dark:text-white px-4">
              <span v-if="stage === stages.home">Select your use case</span>
              <span v-else>Options</span>
            </span>
          </div>
          <div class="grid grid-cols-5 items-center">
            <!-- time frame -->
            <div class="col-span-2">
              <label for="timeframe" class="dark:text-white text-sm">Time frame</label>
              <InformationCircleIcon @click="openModal('timeframe')"
                                     class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"></InformationCircleIcon>
            </div>
            <div class="col-span-3">
              <label
                for="timeframe"
                class="inline-flex items-center rounded-full cursor-pointer dark:text-gray-800 border border-sky-600 dark:border-0"
              >
                <input id="timeframe" type="checkbox" class="hidden peer" v-model="session.future">
                <span
                  class="leading-3 pl-8 pr-7 pt-4 pb-3 rounded-l-full bg-sky-600 text-white peer-checked:text-gray-400 peer-checked:bg-white text-center"><span
                  class="uppercase font-bold">past</span><br><span class="text-sm">(ex-post)</span></span>
                <span
                  class="leading-3 pl-7 pr-8 pt-4 pb-3 rounded-r-full dark:bg-white text-gray-400 peer-checked:bg-sky-600 peer-checked:text-white text-center"><span
                  class="uppercase font-bold">future</span><br><span class="text-sm">(ex-ante)</span></span>
              </label>
            </div>
            <!-- end time frame -->
            <!-- region -->
            <div class="mt-8 col-span-2">
              <label for="region" class="dark:text-white text-sm">Region</label>
              <InformationCircleIcon
                @click="openModal('region')"
                class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"
              ></InformationCircleIcon>
            </div>
            <div class="mt-8 col-span-3">
              <select
                id="region"
                class="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                v-model="session.region"
              >
                <option v-for="(region, i) in regions" v-bind:key="`region-${i}`" :value="region[0]">{{
                    region[1]
                  }}
                </option>
              </select>
              <div v-if="session.region !== 0">
                <div class="flex items-center mb-2 mt-3">
                  <input v-model="session.municipality" id="municipality-1" type="radio" :value="false" name="municipality"
                         class="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                  <label for="municipality-1" class="ml-2 text-xs font-medium text-gray-500 dark:text-gray-300">Whole
                    country</label>
                </div>
                <div class="flex items-center">
                  <input v-model="session.municipality" id="municipality-2" type="radio" :value="true" name="municipality"
                         class="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                  <label for="municipality-2" class="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">Municipality
                    with <input type="number" id="inhabitants"
                                class="bg-gray-50 border border-gray-300 text-gray-500 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline dark:bg-sky-700 dark:border-sky-600 dark:placeholder-sky-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 max-w-[80px]"
                                v-model="session.inhabitants"> <span v-if="stage === stages.home">inhabitants</span><span
                      v-else>inhab.</span></label>
                </div>
              </div>
            </div>
            <!-- end region -->
            <!-- unit -->
            <div class="mt-8 col-span-2">
              <label for="unit" class="dark:text-white text-sm">Unit</label>
              <InformationCircleIcon
                @click="openModal('unit')"
                class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"
              ></InformationCircleIcon>
            </div>
            <div class="mt-8 col-span-3">
              <select
                id="unit"
                class="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                v-model="session.unit"
              >
                <option v-for="[key, value] in Object.entries(units)" v-bind:key="`unit-${key}`" :value="key">{{
                    value.name
                  }}
                </option>
              </select>
            </div>
            <!-- end unit -->
          </div>
        </div>
        <button
          class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded-full uppercase"
          @click="stage = stages.full; session.updateStage(stage);"
          v-if="stage === stages.home"
        >
          Start
        </button>
        <a
          class="border border-sky-500 text-sky-500 hover:border-sky-600 hover:text-sky-600  hover:dark:border-sky-400 hover:dark:text-sky-400 font-bold py-2 px-8 rounded-full uppercase ml-3"
          href="https://fraunhofer-isi.github.io/micat"
          target="_blank"
          v-if="stage === stages.home"
        >
          Learn more
        </a>
        <div class="rounded-3xl border border-gray-300 dark:border-gray-400 relative px-8 py-8 mt-[3rem]"
             v-if="stage === stages.full">
          <div class="absolute top-[-14px] left-0 w-full text-center">
            <span class="inline-block font-bold italic bg-white dark:bg-blue-950 dark:text-white px-4">
              Time frame
              <InformationCircleIcon
                @click="openModal('years')"
                class="h-6 w-6 ml-1 cursor-pointer inline dark:text-white"
              ></InformationCircleIcon>
            </span>
          </div>
          <div class="flex flex-wrap">
            <div v-for="year in years" v-bind:key="year.toString()" class="whitespace-nowrap rounded-full mr-4 mb-7">
              <span class="px-2 py-2 rounded-l-full bg-sky-600 text-white text-center border-sky-600 border">
                {{ year }}
              </span>
              <span class="px-2 py-2 rounded-r-full dark:bg-white text-sky-900 text-center border-sky-600 border">
                <TrashIcon
                  @click="removeYear(year)"
                  class="mt-[-3px] h-5 w-5 inline"
                  :class="{
                      'text-red-200': years.length <= 2,
                      'text-red-700': years.length > 2,
                      'cursor-pointer': years.length > 2,
                    }"
                ></TrashIcon>
              </span>
            </div>
          </div>
          <div class="mt-2">
            <select
              id="new-year"
              class="py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 max-w-[100px]"
              v-model="newYearSelected"
            >
              <option
                v-for="newYear in newYears" v-bind:key="newYear.toString()" :value="newYear"
                :selected="newYear === newYearSelected"
              >
                {{ newYear }}
              </option>
            </select>
            <PlusCircleIcon
              @click="addYear()"
              class="h-7 w-7 ml-5 cursor-pointer inline text-sky-700 dark:text-white"
            ></PlusCircleIcon>
          </div>
        </div>
      </div>
      <div
        class="col col-span-6"
        v-if="stage === stages.full"
      >
        <div
          v-if="error"
          class="flex p-4 mb-7 text-red-800 border-t-4 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800 rounded-2xl"
          role="alert"
        >
          <ExclamationCircleIcon class="h-8 w-8"></ExclamationCircleIcon>
          <div class="ml-3 font-medium">
            <h2 class="font-bold mt-1">We are sorry. Your request could not be processed.</h2>
            <p class="text-sm"><span class="italic">Details</span>: {{ error }}</p>
          </div>
          <button
            type="button"
            class="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
            aria-label="Close"
            @click="error = '';"
          >
            <span class="sr-only">Dismiss</span>
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
<!--        <div-->
<!--          v-if="results"-->
<!--          class="flex p-4 mb-7 text-green-800 border-t-4 border-green-300 bg-green-50 dark:text-green-400 dark:bg-gray-800 dark:border-green-800 rounded-2xl cursor-pointer"-->
<!--          role="alert"-->
<!--          @click="showResults = true;"-->
<!--        >-->
<!--          <PresentationChartBarIcon class="h-8 w-8"></PresentationChartBarIcon>-->
<!--          <div class="ml-3 font-medium">-->
<!--            <h2 class="font-bold mt-1">Results are ready.</h2>-->
<!--            <p class="text-sm">Click here to open the results again.</p>-->
<!--          </div>-->
<!--        </div>-->
        <div
          class="rounded-3xl border border-gray-300 dark:border-gray-400 relative px-8 py-8 mb-5"
          v-for="(program, i) in programs"
          v-bind:key="`program-${i}`"
        >
          <div class="absolute top-[-14px] left-0 w-full text-center">
            <span class="inline-block bg-white dark:bg-blue-950 dark:text-white px-4">
              <input
                type="text"
                :id="`program-name-${i}`"
                class="bg-gray-50 border border-gray-300 text-sky-900 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline dark:bg-sky-700 dark:border-sky-600 dark:placeholder-sky-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 max-w-[85px]"
                v-model="program.name"
              >
              <TrashIcon
                v-if="programs.length >= 2"
                @click="removeProgram(i)"
                class="ml-3 h-5 w-5 inline cursor-pointer text-red-700"
              ></TrashIcon>
            </span>
          </div>
          <div class="flex items-center gap-8">
            <div>
              <label :for="`subsector-${i}`" class="dark:text-white text-sm">Subsector</label>
              <InformationCircleIcon
                @click="openModal('subsector')"
                class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"
              ></InformationCircleIcon>
            </div>
            <div>
              <select
                :id="`subsector-${i}`"
                class="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                v-model="program.subsector"
              >
                <option value="0" selected disabled>Select subsector</option>
                <option v-for="subsector in subsectors" v-bind:key="`subsector-${i}-${subsector.id}`"
                        :value="subsector.id">
                  {{ subsector.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 mt-8 gap-5 items-center">
            <div
              class="rounded-3xl border border-gray-300 dark:border-gray-400 relative mb-2"
              v-for="(improvement, improvementIndex) in program.improvements"
              v-bind:key="`improvement-${i}-${improvement.id}`"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <select
                    :id="`improvement-${i}-${improvement.id}`"
                    class="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                    v-model="improvement.id"
                  >
                    <option value="0" selected disabled>Select improvement</option>
                    <option v-for="improvementSelection in getSubsectorImprovements(program.subsector)"
                            v-bind:key="`improvement-selection-${i}-${improvementSelection.id}`"
                            :value="improvementSelection.id">
                      {{ improvementSelection.name }}
                    </option>
                  </select>
                  <InformationCircleIcon
                    @click="openModal('improvement')"
                    class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"
                  ></InformationCircleIcon>
                </div>
                <div v-for="year in years" v-bind:key="year.toString()" class="whitespace-nowrap rounded-full mt-7">
                  <span class="px-2 py-2 rounded-l-full bg-sky-600 text-white text-center border-sky-600 border">{{
                      year
                    }}</span>
                  <span class="px-2 py-2 rounded-r-full dark:bg-white text-sky-900 text-center border-sky-600 border">
                    <input
                      v-model="improvement.values[year]"
                      :id="`improvement-value-${improvement.id}-${year}`"
                      type="number"
                      :name="`improvement-value-${improvement.id}-${year}`"
                      class="bg-white border-0 text-gray-500 rounded-lg focus:ring-0 focus:border-0 px-1.5 py-0.5 inline max-w-[90px]"
                      placeholder="0"
                    >
                  </span>
                </div>
              </div>
              <div
                class="border-t border-gray-300 dark:border-gray-400 px-6 py-3 text-center bg-blue-50 dark:bg-blue-900 rounded-b-3xl"
              >
                <DocumentDuplicateIcon
                  @click="copyImprovement(program, improvementIndex)"
                  class="mt-[-3px] h-5 w-5 inline mx-1 cursor-pointer text-orange-500 dark:text-orange-400"
                ></DocumentDuplicateIcon>
                <TrashIcon
                  @click="removeImprovement(program, improvementIndex)"
                  class="mt-[-3px] h-5 w-5 inline mx-1 cursor-pointer text-red-700 dark:text-red-400"
                  v-if="program.improvements.length >= 2"
                ></TrashIcon>
              </div>
            </div>
            <PlusCircleIcon
              @click="addImprovement(program)"
              class="h-7 w-7 cursor-pointer inline text-gray-300 dark:text-white"
            ></PlusCircleIcon>
          </div>
        </div>
        <div class="text-center mb-5">
          <button
            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 pl-3 pr-4 rounded-full uppercase text-xs"
            @click="addProgram()"
          >
            <PlusCircleIcon class="h-5 w-5 mt-[-2px] inline text-white"></PlusCircleIcon>
            Add program
          </button>
        </div>
        <div
          class="text-center sticky bottom-3"
        >
          <button
            class="bg-amber-300 hover:bg-amber-400 font-bold py-2 px-8 rounded-full uppercase text-xl"
            @click="analyze()"
            ref="analyzeButton"
          >
            Analyze
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
