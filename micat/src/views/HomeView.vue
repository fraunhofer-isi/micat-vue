<script setup async lang="ts">
import {inject, onMounted, ref, watch} from 'vue';
import type {Ref} from 'vue';
import {
  InformationCircleIcon,
  TrashIcon,
  PlusCircleIcon,
  DocumentDuplicateIcon
} from '@heroicons/vue/24/outline';
import type {
  ModalInjectInterface,
  StageInjectInterface,
  ProgramInterface,
  SubsectorInterface,
  ImprovementValueInterface,
  PayloadInterface,
  PayloadMeasureInterface,
  ResultsInterface,
} from "@/types";
import {defaultImprovement, defaultModalInject, defaultProgram, defaultStageInject} from "@/defaults";
import ResultsOverlay from "@/components/ResultsOverlay.vue";

// Injections
const {openModal} = inject<ModalInjectInterface>('modal') || defaultModalInject
const {stage, stages} = inject<StageInjectInterface>('stage') || defaultStageInject

// Variables
let regions: Ref<Array<Array<number | string>>> = ref([]);
let subsectors: Ref<Array<SubsectorInterface>> = ref([]);
const units = {
  1: "ktoe (tonne of oil equivalent)",
  2: "MJ (Megajoule)",
  3: "GJ (Gigajoule)",
  4: "MWh (Energy quantity per hour)",
}
const future = ref<boolean>(false);
const region = ref<number>(0);
const municipality = ref<boolean>(false);
const inhabitants = ref<number>(100000);
const unit = ref<number>(1);
let currentYear = Math.floor(new Date().getFullYear() / 5) * 5;
const years = ref<Array<number>>([currentYear - 10, currentYear - 5, currentYear]);
const newYears = ref<Array<number>>([...Array(30).keys()].map(delta => currentYear - delta).filter(newYear => years.value.indexOf(newYear) == -1));
const newYearSelected = ref<number>(newYears.value[0]);
const programs = ref<Array<ProgramInterface>>([structuredClone(defaultProgram)]);
const results = ref<ResultsInterface>({
    "addedAssetValueOfBuildings": {
        "idColumnNames": [
            "id_measure",
            "sector"
        ],
        "rows": [
            [
                1,
                "Tertiary",
                0,
                0,
                0
            ],
            [
                1,
                "Residential",
                0,
                0,
                0
            ],
            [
                2,
                "Tertiary",
                0,
                0,
                0
            ],
            [
                2,
                "Residential",
                0,
                0,
                0
            ],
            [
                3,
                "Tertiary",
                0,
                0,
                0
            ],
            [
                3,
                "Residential",
                0,
                0,
                0
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "additionalEmployment": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                -230442.2680777662,
                -460884.5361555324,
                -691326.8042332986
            ],
            [
                2.0,
                -1152211.3403888312,
                -691326.8042332986,
                -921769.0723110648
            ],
            [
                3.0,
                -230442.2680777662,
                -530017.2165788623,
                -115221.1340388831
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
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
                -1.0,
                -1.0,
                0.00019466573607446191
            ],
            [
                1,
                "Coal",
                1.6516089349771779e-06,
                4.1766752086613845e-06,
                1.536700030921323e-05
            ],
            [
                1,
                "Gas",
                0.00047969250293303234,
                0.0010174015519220092,
                0.00010237157100997929
            ],
            [
                2,
                "Oil",
                -1.0,
                -1.0,
                0.000936843294168363
            ],
            [
                2,
                "Coal",
                5.0367568492915016e-05,
                1.821871992335744e-05,
                9.961887660597801e-05
            ],
            [
                2,
                "Gas",
                0.0017399257389793532,
                0.0008374581397813385,
                9.70635703760464e-05
            ],
            [
                3,
                "Oil",
                -1.0,
                -1.0,
                -1.311708711093651e-08
            ],
            [
                3,
                "Coal",
                9.165890780649111e-05,
                0.000173856504363315,
                0.00010271647257562022
            ],
            [
                3,
                "Gas",
                -9.95772198947309e-07,
                -2.8112528878410092e-06,
                -4.899748459047393e-08
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "changeInUnitCostsOfProduction": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                -6.922774179438836e-06,
                -2.060932771909542e-05,
                -3.070641155972932e-05
            ],
            [
                2.0,
                -0.0007287025372942754,
                -0.00067830179090432,
                -0.0008840373635753433
            ],
            [
                3.0,
                -4.327517872388138e-05,
                -0.00012733675263436328,
                -3.276676547238891e-05
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "energyIntensity": {
        "idColumnNames": [
            "label"
        ],
        "rows": [
            [
                "Baseline",
                0.00012884819686002135,
                0.0001284350306055675,
                0.00010301177035581032
            ],
            [
                "Including saving",
                -8.886416720962467e-07,
                -8.92500733291752e-07,
                -7.363530170642408e-07
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
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
                21.80281481030819,
                30.189300262606192,
                38.66290160077291
            ],
            [
                1,
                "Coal",
                2.4131804929713354,
                5.6706014534917015,
                7.2484099392305605
            ],
            [
                1,
                "Gas",
                37.78873092002988,
                80.52822445171353,
                117.88439142791385
            ],
            [
                1,
                "Biomass and renewable waste",
                4.308542553342157,
                12.406088839530604,
                19.687949714782647
            ],
            [
                1,
                "Renewables",
                0.6553146678916781,
                1.6908783446963065,
                3.2178068760651817
            ],
            [
                1,
                "Other",
                25.57167612206983,
                51.141754265047716,
                75.1091941380682
            ],
            [
                2,
                "Oil",
                238.78461951782126,
                169.29600490548683,
                182.96031990191653
            ],
            [
                2,
                "Coal",
                44.9601110575666,
                16.933182651012274,
                26.22418355054702
            ],
            [
                2,
                "Gas",
                136.97451487042858,
                66.32583961988229,
                111.29616126289403
            ],
            [
                2,
                "Biomass and renewable waste",
                1.2752670807157303,
                1.603387340410189,
                1.9508726996272745
            ],
            [
                2,
                "Renewables",
                2.106459356908465,
                1.4421714309594797,
                2.661747490133355
            ],
            [
                2,
                "Other",
                82.19821572507611,
                43.61944616627572,
                62.129803522395186
            ],
            [
                3,
                "Oil",
                -0.01374382617049142,
                -0.01896114051240959,
                -0.0026142887864729434
            ],
            [
                3,
                "Coal",
                75.70818845689898,
                143.7305336649173,
                23.907840391726317
            ],
            [
                3,
                "Gas",
                -0.07723409401798047,
                -0.21828108116223305,
                -0.05417866204502413
            ],
            [
                3,
                "Biomass and renewable waste",
                24.416171204135615,
                86.62508020341063,
                26.189574175015014
            ],
            [
                3,
                "Renewables",
                -0.00025082303058829926,
                -0.0009231918450904125,
                -0.00025538220306172495
            ],
            [
                3,
                "Other",
                -0.009787611381865504,
                -0.027922559082504406,
                -0.005961063608834834
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "impactOnGrossDomesticProduct": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                -230442268077.76617,
                -460884536155.53235,
                -691326804233.2986
            ],
            [
                2.0,
                -1152211340388.831,
                -691326804233.2986,
                -921769072311.0647
            ],
            [
                3.0,
                -230442268077.76617,
                -530017216578.86224,
                -115221134038.88309
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "impactOnResTargetsMonetization": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                936840.7640536285,
                2814672.206224982,
                6134295.443963817
            ],
            [
                2.0,
                5125571.507800997,
                4637014.40060804,
                9072743.196650758
            ],
            [
                3.0,
                1012596.5261542548,
                3565698.5846467847,
                1172319.8400901202
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "lifetime": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                15.0
            ],
            [
                2.0,
                8.0
            ],
            [
                3.0,
                8.0
            ]
        ],
        "yearColumnNames": [
            "value"
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
                0.0009876250975348875,
                0.0015820959375688688,
                0.002005554177040513
            ],
            [
                1,
                "Offshore wind",
                8.444975553959879e-06,
                3.4452590991681145e-05,
                0.00017902807519436128
            ],
            [
                1,
                "Solar",
                2.976824295769417e-05,
                0.0006859901963231513,
                0.0017086202868206938
            ],
            [
                2,
                "Onshore wind",
                0.003174646058988997,
                0.0013493895461820916,
                0.001658980480392235
            ],
            [
                2,
                "Offshore wind",
                2.7145734173376555e-05,
                2.938504866809831e-05,
                0.0001480907798900309
            ],
            [
                2,
                "Solar",
                9.568776190940454e-05,
                0.0005850896761193198,
                0.0014133588295383423
            ],
            [
                3,
                "Onshore wind",
                -3.780155277856721e-07,
                -8.637984348759166e-07,
                -1.5917140581120314e-07
            ],
            [
                3,
                "Offshore wind",
                -3.232331680447675e-09,
                -1.8810549644521045e-08,
                -1.4208616618081338e-08
            ],
            [
                3,
                "Solar",
                -1.1393855928724386e-08,
                -3.745393966656126e-07,
                -1.3560515899506275e-07
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "reductionOfAdditionalCapacitiesInGridMonetization": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                1366.3422985339287,
                2768.411241964801,
                4643.38704290688
            ],
            [
                2.0,
                4392.003812071492,
                2361.21280684198,
                3840.9774990252613
            ],
            [
                3.0,
                -0.5229703117158243,
                -1.5115071350077287,
                -0.36852379846235567
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
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
                0.1517505570902828,
                0.15068105090480147,
                0.16183356708855218
            ],
            [
                1,
                "NOX",
                0.1522061233676995,
                0.2685175014615028,
                0.36672897874326443
            ],
            [
                1,
                "PM_2_5",
                0.09061097938671117,
                0.21302808090407163,
                0.26165967656338335
            ],
            [
                2,
                "SO2",
                5.102345470666542,
                1.9305614149152186,
                1.52956445173819
            ],
            [
                2,
                "NOX",
                1.581469013588102,
                0.819047530721327,
                0.8639806149028725
            ],
            [
                2,
                "PM_2_5",
                0.060777070401533594,
                0.035131295633464024,
                0.036464200991045144
            ],
            [
                3,
                "SO2",
                0.0,
                0.0,
                0.0
            ],
            [
                3,
                "NOX",
                0.0,
                0.0,
                0.0
            ],
            [
                3,
                "PM_2_5",
                0.0,
                0.0,
                0.0
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
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
                24074254.94390699,
                78312626.76030168,
                132413372.26965289
            ],
            [
                1,
                "Oil",
                9655315.099449405,
                22386644.7612284,
                24893855.12606713
            ],
            [
                1,
                "Coal",
                210330.2236344006,
                688865.3700211283,
                904967.1134458608
            ],
            [
                1,
                "Gas",
                6346799.018337788,
                25505835.461713005,
                41812748.45871614
            ],
            [
                1,
                "Biomass and Waste",
                3539423.484167412,
                9787736.484358951,
                15779628.09449727
            ],
            [
                1,
                "Heat",
                3381971.1711069965,
                10983475.079677604,
                16672154.151891863
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
                87458638.6851598,
                75488879.64007775,
                123789949.760498
            ],
            [
                2,
                "Oil",
                78641014.14759971,
                93612227.4737794,
                88561844.36136925
            ],
            [
                2,
                "Coal",
                8624508.373912415,
                4038743.669907326,
                7883638.940919064
            ],
            [
                2,
                "Gas",
                36417697.54961884,
                33157989.027924057,
                62561629.08489424
            ],
            [
                2,
                "Biomass and Waste",
                60413.75363268467,
                267953.85185017064,
                151422.461858982
            ],
            [
                2,
                "Heat",
                884208.422794317,
                860426.207117211,
                2710203.4209880764
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
                -10413.987212330578,
                -48323.463204624764,
                -11877.065801291452
            ],
            [
                3,
                "Oil",
                -4509.60899893757,
                -10387.10453252258,
                -1236.3042388462243
            ],
            [
                3,
                "Coal",
                15701961.663295263,
                38606347.499689355,
                8128764.804733531
            ],
            [
                3,
                "Gas",
                -20801.109817057615,
                -111203.30735151852,
                -31015.177365323474
            ],
            [
                3,
                "Biomass and Waste",
                21974683.555271994,
                77963324.40840928,
                23570770.68862484
            ],
            [
                3,
                "Heat",
                -8052.243215779026,
                -51414.364721823775,
                -19802.630355136575
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
            "2000",
            "2010",
            "2020"
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
            "2000",
            "2010",
            "2020"
        ]
    },
    "reductionOfGreenHouseGasEmission": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                149.42400812778925,
                271.2716282205097,
                373.5570922199623
            ],
            [
                2.0,
                1074.606647513801,
                641.2022932468316,
                798.9543016530874
            ],
            [
                3.0,
                0.0,
                0.0,
                0.0
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "reductionOfGreenHouseGasEmissionMonetization": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                29735377.61743006,
                53983054.01588143,
                74337861.3517725
            ],
            [
                2.0,
                213846722.8552464,
                127599256.35611948,
                158991906.0289644
            ],
            [
                3.0,
                0.0,
                0.0,
                0.0
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
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
                3.6071656893676973e-06,
                5.3810983324797945e-06,
                8.432763435650692e-06
            ],
            [
                1,
                "Coal",
                5.889869315711671e-06,
                1.3916976596251018e-05,
                3.079921854509671e-05
            ],
            [
                1,
                "Gas",
                4.917954726058049e-05,
                7.396735913722807e-05,
                6.161137690130492e-05
            ],
            [
                2,
                "Oil",
                3.952201246670839e-05,
                3.018447121982959e-05,
                3.9919409964839225e-05
            ],
            [
                2,
                "Coal",
                0.00010975115298517135,
                4.155986854670335e-05,
                0.00011144418588360239
            ],
            [
                2,
                "Gas",
                0.00017832318761845656,
                6.091965361854079e-05,
                5.8166916676039015e-05
            ],
            [
                3,
                "Oil",
                -2.273752408576968e-09,
                -3.3795315435014572e-09,
                -5.701490390919162e-10
            ],
            [
                3,
                "Coal",
                0.000184829877347914,
                0.00035294545150343914,
                0.00010159881618720945
            ],
            [
                3,
                "Gas",
                -1.0050221099788814e-07,
                -2.0045164228488233e-07,
                -2.8305853772003786e-08
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "reductionOfLostWorkDays": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                0.0,
                71970.4091501169,
                8690.037408064767
            ],
            [
                2.0,
                0.0,
                3411.442390463077,
                1966.6420387300882
            ],
            [
                3.0,
                0.0,
                0.0,
                0.0
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "reductionOfLostWorkDaysMonetization": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                0.0,
                11916195.180114938,
                1689021.2967757578
            ],
            [
                2.0,
                0.0,
                564835.1016830348,
                382242.3460993296
            ],
            [
                3.0,
                0.0,
                0.0,
                0.0
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
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
                19.380847827726704,
                88.85271209077388,
                18.91670942902121
            ],
            [
                2,
                "Mortality_AP",
                44.27510308729216,
                10.710143712277334,
                6.0760044577112895
            ],
            [
                3,
                "Mortality_AP",
                0.0,
                0.0,
                0.0
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "reductionOfMortalityMorbidityMonetization": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                55428782.06276124,
                254116726.88121292,
                63509395.59569275
            ],
            [
                2.0,
                126625783.43558782,
                30630766.36097327,
                20399074.807057776
            ],
            [
                3.0,
                0.0,
                0.0,
                0.0
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "renewableEnergyDirectiveTargets": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                3.7449018348359453e-06,
                1.0796910351329458e-05,
                2.7630171538811643e-05
            ],
            [
                2.0,
                2.049437885969646e-05,
                1.7788619313771625e-05,
                4.086935105604428e-05
            ],
            [
                3.0,
                4.047745716356799e-06,
                1.3678218555662758e-05,
                5.279552097614548e-06
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
        ]
    },
    "subsidyRate": {
        "idColumnNames": [
            "id_measure"
        ],
        "rows": [
            [
                1.0,
                30.0,
                30.0,
                30.0
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
                30.0
            ]
        ],
        "yearColumnNames": [
            "2000",
            "2010",
            "2020"
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
            "2000",
            "2010",
            "2020"
        ]
    }
});
const showResults = ref<boolean>(true);

// Watchers
watch(future, async (newFuture) => {
  // Check if there are valid years defined. If not add default ones.
  currentYear = new Date().getFullYear();
  if (newFuture) {
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
})

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
  newYears.value = newYears.value.filter(newYear => newYear !== newYearSelected.value);
  newYearSelected.value = newYears.value[0];
};
const removeYear = (year: number) => {
  if (years.value.length > 2) {
    // Keep at least two years
    years.value = years.value.filter(x => x !== year);
    newYears.value.push(year);
    newYears.value.sort();
  }
};
const addProgram = () => {
  const clone = JSON.parse(JSON.stringify(defaultProgram));
  clone.name = `Program ${programs.value.length + 1}`
  programs.value.push(clone);
}
const removeProgram = (i: number) => {
  if (programs.value.length >= 2) {
    programs.value.splice(i, 1);
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
  if (!subsectorId) return [];
  return subsectors.value.filter(subsector => subsector.id === subsectorId)[0].improvements;
}
const analyze = async () => {
  const url = `https://micatool-dev.eu/mica-tool-wGlobal/python/back_end/src/api/indicator_data?id_mode=${future.value ? 4 : 2}&id_region=${region.value}`
  const payload: PayloadInterface = {
    "measures": [],
    "parameters": {}
  }
  let i = 1;
  programs.value.forEach(program => {
    program.improvements.forEach(improvement => {
      const improvementData: PayloadMeasureInterface = {
        "id": i,
        "savings": {
          "details": {
            "parameters": [],
            "finalParameters": [],
            "constants": [],
          },
          "id_measure": 1,
          "id_subsector": program.subsector,
          "id_action_type": improvement.id,
        },
        "parameters": {}
      };

      years.value.forEach(year => {
        const value = improvement.values[year.toString()];
        improvementData.savings[year.toString()] = value ? value : 0;
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
  results.value = await response.json();
  showResults.value = true;
}
</script>

<template>
  <main>
    <ResultsOverlay v-if="showResults" :results="results" :years="years" @close="showResults = false;"></ResultsOverlay>
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
              <label for="timeframe"
                     class="inline-flex items-center rounded-full cursor-pointer dark:text-gray-800 border border-sky-600 dark:border-0">
                <input id="timeframe" type="checkbox" class="hidden peer" v-model="future">
                <span
                  class="leading-3 pl-8 pr-7 pt-4 pb-3 rounded-l-full bg-sky-600 text-white peer-checked:text-sky-900 peer-checked:bg-white text-center"><span
                  class="uppercase font-bold">past</span><br><span class="text-sm">(ex-post)</span></span>
                <span
                  class="leading-3 pl-7 pr-8 pt-4 pb-3 rounded-r-full dark:bg-white text-sky-900 peer-checked:bg-sky-600 peer-checked:text-white text-center"><span
                  class="uppercase font-bold">future</span><br><span class="text-sm">(ex-ante)</span></span>
              </label>
            </div>
            <!-- end time frame -->
            <!-- region -->
            <div class="mt-8 col-span-2">
              <label for="region" class="dark:text-white text-sm">Region</label>
              <InformationCircleIcon @click="openModal('region')"
                                     class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"></InformationCircleIcon>
            </div>
            <div class="mt-8 col-span-3">
              <select
                id="region"
                class="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                v-model="region"
              >
                <option v-for="(region, i) in regions" v-bind:key="`region-${i}`" :value="region[0]">{{
                    region[1]
                  }}
                </option>
              </select>
              <div v-if="region !== 0">
                <div class="flex items-center mb-2 mt-3">
                  <input v-model="municipality" id="municipality-1" type="radio" :value="false" name="municipality"
                         class="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                  <label for="default-radio-1" class="ml-2 text-xs font-medium text-gray-500 dark:text-gray-300">Whole
                    country</label>
                </div>
                <div class="flex items-center">
                  <input v-model="municipality" id="municipality-2" type="radio" :value="true" name="municipality"
                         class="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                  <label for="default-radio-2" class="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">Municipality
                    with <input type="number" id="inhabitants"
                                class="bg-gray-50 border border-gray-300 text-gray-500 text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 w-full px-1.5 py-0.5 inline dark:bg-sky-700 dark:border-sky-600 dark:placeholder-sky-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 max-w-[80px]"
                                v-model="inhabitants"> <span v-if="stage === stages.home">inhabitants</span><span
                      v-else>inhab.</span></label>
                </div>
              </div>
            </div>
            <!-- end region -->
            <!-- unit -->
            <div class="mt-8 col-span-2">
              <label for="unit" class="dark:text-white text-sm">Unit</label>
              <InformationCircleIcon @click="openModal('unit')"
                                     class="h-6 w-6 ml-2 cursor-pointer inline dark:text-white"></InformationCircleIcon>
            </div>
            <div class="mt-8 col-span-3">
              <select
                id="unit"
                class="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-200 dark:border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                v-model="unit"
              >
                <option v-for="[key, value] in Object.entries(units)" v-bind:key="`unit-${key}`" :value="key">{{
                    value
                  }}
                </option>
              </select>
            </div>
            <!-- end unit -->
          </div>
        </div>
        <button
          class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded-full uppercase"
          @click="stage = stages.full"
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
          <div class="grid grid-cols-3 mt-8 gap-5 items-center">
            <div
              class="rounded-3xl border border-gray-300 dark:border-gray-400 relative mb-2"
              v-for="(improvement, improvementIndex) in program.improvements"
              v-bind:key="`improvement-${i}-${improvement.id}`"
            >
              <div class="p-6">
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
